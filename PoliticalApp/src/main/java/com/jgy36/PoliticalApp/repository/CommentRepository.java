package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.Comment;
import com.jgy36.PoliticalApp.entity.Politician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPolitician(Politician politician);
}
