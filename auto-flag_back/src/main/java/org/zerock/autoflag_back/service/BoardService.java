package org.zerock.autoflag_back.service;

import org.springframework.web.multipart.MultipartFile;
import org.zerock.autoflag_back.dto.BoardDTO;
import org.zerock.autoflag_back.dto.PageRequestDTO;
import org.zerock.autoflag_back.dto.PageResponseDTO;

public interface BoardService {

    Long register(BoardDTO boardDTO, MultipartFile image);

    BoardDTO readOne(Long bno);

    void modify(Long bno, BoardDTO boardDTO);

    void remove(Long bno);

    PageResponseDTO<BoardDTO> list(PageRequestDTO pageRequestDTO);
}
