package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.GinglesIncomeData;

@Repository
public interface GinglesIncomeDataRepository extends MongoRepository<GinglesIncomeData, String> {
    GinglesIncomeData findByStateIgnoreCaseAndDataIgnoreCase(String state, String data);
}