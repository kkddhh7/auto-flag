package org.zerock.autoflag_back.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.zerock.autoflag_back.dto.BoardDTO;
import org.zerock.autoflag_back.dto.PageRequestDTO;
import org.zerock.autoflag_back.dto.PageResponseDTO;
import org.zerock.autoflag_back.service.BoardService;

import javax.validation.Valid;
import java.io.File;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/board")
@Log4j2
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/list")
    public ResponseEntity<PageResponseDTO<BoardDTO>> list(PageRequestDTO pageRequestDTO) {
        PageResponseDTO<BoardDTO> responseDTO = boardService.list(pageRequestDTO);
        log.info(responseDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerPost(
            @RequestParam("address") String address,
            @RequestParam("latitude") double latitude,
            @RequestParam("longitude") double longitude,
            @RequestParam("memo") String memo,
            @RequestParam("image") MultipartFile image) {

        log.info("board POST register............");

        try {
            String fileName = image.getOriginalFilename();
            String filePath = "/Users/kkddhh/Desktop/project/auto-flag/auto-flag_back/uploads/" + fileName;

            log.info("Saving image to: " + filePath);

            File dest = new File(filePath);
            image.transferTo(dest);

            if (!dest.exists()) {
                log.error("Image was not saved to the destination: " + filePath);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
            }

            String imagePath = "http://localhost:3000/uploads/" + fileName;
            log.info("Image saved successfully, imagePath: " + imagePath);


            // DTO 생성
            BoardDTO boardDTO = BoardDTO.builder()
                    .address(address)
                    .latitude(latitude)
                    .longitude(longitude)
                    .memo(memo)
                    .imagePath(imagePath)
                    .build();

            Long bno = boardService.register(boardDTO, image);

            log.info("Bno registered with ID: " + bno);

            Map<String, Object> response = new HashMap<>();
            response.put("imageUrl", imagePath);
            response.put("address", address);
            response.put("latitude", latitude);
            response.put("longitude", longitude);
            response.put("memo", memo);
            response.put("bno", bno);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error saving image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/{bno}")
    public ResponseEntity<Map<String, Object>> modifyPost(@PathVariable Long bno, @RequestBody BoardDTO boardDTO) {
        log.info("board PUT modify............");

        try {
            boardService.modify(bno, boardDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "수정 성공");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("수정 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{bno}")
    public ResponseEntity<Map<String, Object>> deletePost(@PathVariable Long bno) {
        log.info("board DELETE delete............");

        try {
            boardService.remove(bno);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "삭제 성공");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("삭제 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


}
