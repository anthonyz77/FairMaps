package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.GinglesData;

@Repository
public interface GinglesRaceDataRepository extends MongoRepository<GinglesData, String> {
    GinglesData findByStateIgnoreCaseAndDataIgnoreCaseAndRaceIgnoreCase(String state, String data, String population);
}