package org.zerock.autoflag_back.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.zerock.autoflag_back.domain.Board;
import org.zerock.autoflag_back.dto.BoardDTO;
import org.zerock.autoflag_back.dto.PageRequestDTO;
import org.zerock.autoflag_back.dto.PageResponseDTO;
import org.zerock.autoflag_back.repository.BoardRepository;

import javax.transaction.Transactional;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class BoardServiceImpl implements BoardService {

    private final ModelMapper modelMapper;

    private final BoardRepository boardRepository;

    private static final String UPLOAD_DIRECTORY = "/Users/kkddhh/Desktop/project/auto-flag/auto-flag_back/uploads";

    @Override
    public Long register(BoardDTO boardDTO, MultipartFile image) {
        // 이미 BoardController에서 이미지 저장과 경로 설정이 완료되었으므로, 이 부분에서는 저장 로직을 제거합니다.
        Board board = modelMapper.map(boardDTO, Board.class);
        Long bno = boardRepository.save(board).getBno();
        log.info("Board entity saved with Bno: " + bno);

        return bno;
    }


    private String saveImage(MultipartFile image) throws IOException {
        byte[] bytes = image.getBytes();
        Path path = Paths.get(UPLOAD_DIRECTORY, image.getOriginalFilename());

        // 디렉터리가 존재하지 않으면 생성
        File directory = new File(UPLOAD_DIRECTORY);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        try {
            Files.write(path, bytes);
            log.info("Image successfully written to: " + path.toString());
        } catch (IOException e) {
            log.error("Error writing image to: " + path.toString(), e);
            throw e; // Re-throw the exception to handle it in the calling method
        }

        return path.toString();
    }


    @Override
    public BoardDTO readOne(Long bno) {

        Optional<Board> result = boardRepository.findById(bno);

        Board board = result.orElseThrow();

        BoardDTO boardDTO = modelMapper.map(board, BoardDTO.class);

        return boardDTO;
    }

    @Override
    public void modify(Long bno, BoardDTO boardDTO) {
        Optional<Board> result = boardRepository.findById(bno);
        if (result.isPresent()) {
            Board board = result.get();
            board.change(boardDTO.getAddress(), boardDTO.getLatitude(), boardDTO.getLongitude(), boardDTO.getMemo());

            boardRepository.save(board);
        } else {
            throw new RuntimeException("Board not found with BNO: " + bno);
        }
    }

    @Override
    public void remove(Long bno) {
        if (boardRepository.existsById(bno)) {
            boardRepository.deleteById(bno);
        } else {
            throw new RuntimeException("Board not found with BNO: " + bno);
        }
    }

    @Override
    public PageResponseDTO<BoardDTO> list(PageRequestDTO pageRequestDTO) {

        String[] types = pageRequestDTO.getTypes();
        String keyword = pageRequestDTO.getKeyword();
        Pageable pageable = pageRequestDTO.getPageable("bno");

        Page<Board> result = boardRepository.searchAll(types, keyword, pageable);

        List<BoardDTO> dtoList = result.getContent().stream()
                .map(board -> modelMapper.map(board, BoardDTO.class)).collect(Collectors.toList());


        return PageResponseDTO.<BoardDTO>withAll()
                .pageRequestDTO(pageRequestDTO)
                .dtoList(dtoList)
                .total((int)result.getTotalElements())
                .build();
    }

}
