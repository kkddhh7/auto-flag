package org.zerock.autoflag_back.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.zerock.autoflag_back.dto.BoardDTO;
import org.zerock.autoflag_back.dto.PageRequestDTO;
import org.zerock.autoflag_back.dto.PageResponseDTO;
import org.zerock.autoflag_back.service.BoardService;

import javax.validation.Valid;


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
    public ResponseEntity<Long> registerPost(@Valid @ModelAttribute BoardDTO boardDTO) {
        log.info("board POST register............");
        Long bno = boardService.register(boardDTO);
        log.info(boardDTO);
        return ResponseEntity.ok(bno);
    }
}
