package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.DistrictBoundary;

@Repository
public interface DistrictBoundaryRepository extends MongoRepository<DistrictBoundary, String>{
    DistrictBoundary findByStateIgnoreCase(String state);
}
