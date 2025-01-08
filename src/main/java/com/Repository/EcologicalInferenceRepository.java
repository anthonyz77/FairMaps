package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.EcologicalInference;

@Repository
public interface EcologicalInferenceRepository extends MongoRepository<EcologicalInference, String>{
    EcologicalInference findByStateIgnoreCaseAndRaceIgnoreCaseAndCandidateIgnoreCaseAndTypeIgnoreCaseAndRegionIgnoreCase(String state, String race, String candidate, String type, String region);
}
