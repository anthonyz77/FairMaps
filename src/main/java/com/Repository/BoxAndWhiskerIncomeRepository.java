package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.BoxAndWhiskerIncomeModel;

@Repository
public interface BoxAndWhiskerIncomeRepository extends MongoRepository<BoxAndWhiskerIncomeModel, String>{
    BoxAndWhiskerIncomeModel findByStateIgnoreCaseAndTypeIgnoreCaseAndRegionIgnoreCase(String state, String type, String regionForRace);
}
