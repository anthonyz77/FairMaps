package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.CongressionalTable;

@Repository
public interface CongressionalTableRepository extends MongoRepository<CongressionalTable, String> {
    CongressionalTable findByStateIgnoreCase(String state);
}