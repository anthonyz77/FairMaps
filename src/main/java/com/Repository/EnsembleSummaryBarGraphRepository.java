package com.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.Model.EnsembleSummaryBarGraph;

@Repository
public interface EnsembleSummaryBarGraphRepository extends MongoRepository<EnsembleSummaryBarGraph, String>{
    EnsembleSummaryBarGraph findByStateIgnoreCaseAndEnsembleIgnoreCase(String state, String ensemble);
}
