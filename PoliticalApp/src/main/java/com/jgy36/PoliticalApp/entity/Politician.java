package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "politicians")
public class Politician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String party;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String position; // e.g., "Senator", "Governor", "Representative"

    @Column(nullable = false)
    private int yearsServed;

    @Column(nullable = false)
    private int termLength;
}
