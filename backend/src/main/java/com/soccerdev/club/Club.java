package com.soccerdev.club;

import com.soccerdev.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "clubs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Club extends BaseEntity {

    @NotBlank
    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;
}
