package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "politicians", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"name", "state", "county"})
})
public class Politician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String party;

    @Column(nullable = false)
    private String state;

    @Column(nullable = true)
    private String county;

    @Column(nullable = false)
    private String position;

    @Column(nullable = false)
    private int yearsServed;

    @Column(nullable = false)
    private int termLength;

    @Column(nullable = true)
    private String photoUrl;
}
