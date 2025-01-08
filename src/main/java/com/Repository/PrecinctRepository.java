package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.PrecinctModel;

@Repository
public interface PrecinctRepository extends MongoRepository<PrecinctModel, String> {
    PrecinctModel findByStateIgnoreCase(String state);
}