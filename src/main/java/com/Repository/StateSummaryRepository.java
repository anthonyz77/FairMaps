package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.StateSummary;

@Repository
public interface StateSummaryRepository extends MongoRepository<StateSummary, String> {
    StateSummary findByStateIgnoreCase(String state); 
}