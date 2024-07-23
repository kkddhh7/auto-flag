package org.zerock.autoflag_back.domain;

import lombok.*;

import javax.persistence.*;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Board extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bno;

    @Column(length = 50, nullable = false)
    private String address;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(length = 500)
    private String memo;

    public void change(String address, double latitude, double longitude, String memo) {
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.memo = memo;
    }
}
