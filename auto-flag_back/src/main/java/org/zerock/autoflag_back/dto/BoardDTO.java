package org.zerock.autoflag_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardDTO {

    private Long bno;

    private String address;

    private double latitude;

    private double longitude;

    private String memo;

    private LocalDateTime regDate;

    private LocalDateTime modDate;
}
