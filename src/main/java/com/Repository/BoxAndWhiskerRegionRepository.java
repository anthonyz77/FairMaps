package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.BoxAndWhiskerRegionModel;

@Repository
public interface BoxAndWhiskerRegionRepository extends MongoRepository<BoxAndWhiskerRegionModel, String>{
    BoxAndWhiskerRegionModel findByStateIgnoreCaseAndTypeIgnoreCaseAndRegionIgnoreCase(String state, String type, String regionForRace);
}
