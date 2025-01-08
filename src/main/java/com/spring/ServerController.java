package com.spring;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.Repository.PrecinctRepository;
import com.Repository.StateSummaryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.Model.PrecinctModel;
import com.Model.StateSummary;
import com.Model.DistrictBoundary;
import com.Model.CongressionalTable;
import com.Model.GinglesData;
import com.Model.GinglesIncomeData;
import com.Model.EcologicalInference;
import com.Repository.DistrictBoundaryRepository;
import com.Repository.GinglesIncomeDataRepository;
import com.Repository.GinglesRaceDataRepository;
import com.Repository.EcologicalInferenceRepository;
import com.Model.BoxAndWhiskerLAModel;
import com.Model.BoxAndWhiskerIncomeModel;
import com.Model.BoxAndWhiskerRegionModel;
import com.Model.EnsembleSummaryBarGraph;
import com.Repository.BoxAndWhiskerLARepository;
import com.Repository.BoxAndWhiskerIncomeRepository;
import com.Repository.BoxAndWhiskerRegionRepository;
import com.Repository.CongressionalTableRepository;
import com.Repository.EnsembleSummaryBarGraphRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.web.bind.annotation.PathVariable;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ServerController {
    private static final String SUMMARY_CACHE_KEY_SUFFIX = "summaryKey";
    private static final String PRECINCT_BOUNDARY_CACHE_KEY_SUFFIX = "precinctBoundaryKey";
    private static final String DISTRICT_KEY_SUFFIX = "districtKey";
    private static final String BW_KEY_SUFFIX = "bwKey";
    private static final String CONGRESSIONAL_TABLE_CACHE_KEY_SUFFIX = "congressionalTableKey";
    private static final String GINGLES_CACHE_KEY_SUFFIX = "ginglesKey";
    private static final String ENSEMBLE_SUMMARY_DATA_SUFFIX = "ensembleKey";
    private static final String ECOINFERENCE_CACHE_KEY_SUFFIX = "ecoKey";
    private static final String SUMMARY_CACHE="stateSummaryData";
    private static final String PRECINCT_CACHE="precinctData";
    private static final String DISTRICT_CACHE="districtData";
    private static final String BW_CACHE="bwData";
    private static final String ES_CACHE="ensembleSummaryData";
    private static final String CONGRESSIONAL_TABLE_CACHE="congressionalCache";
    private static final String GINGLES_CACHE="ginglesCache";
    private static final String ECOINFERENCE_CACHE="ecoCache";
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Autowired
    private CacheHandler cacheHandler;

    @Autowired
    private StateSummaryRepository stateSumRepo;

    @Autowired
    private GinglesRaceDataRepository ginglesRepo;

    @Autowired
    private GinglesIncomeDataRepository ginglesIncomeRepo;

    @Autowired
    private CongressionalTableRepository congressTableRepo;

    @Autowired
    private PrecinctRepository PrecinctRepo;

    @Autowired
    private DistrictBoundaryRepository DistrictRepo;

    @Autowired
    private BoxAndWhiskerLARepository BoxAndWhiskRepo;

    @Autowired
    private BoxAndWhiskerIncomeRepository BoxAndWhiskRepoIncome;

    @Autowired
    private BoxAndWhiskerRegionRepository BoxAndWhiskRepoRegion;

    @Autowired
    private EnsembleSummaryBarGraphRepository EnsembleSummaryRepo;

    @Autowired
    private EcologicalInferenceRepository EcoInferenceRepo;

    @GetMapping("/info/{state}")
    public ResponseEntity<Map<String, Object>> getStateSummary(@PathVariable String state) {
        String cacheKey = state + SUMMARY_CACHE_KEY_SUFFIX;
        String cacheName = SUMMARY_CACHE;
        Map<String, Object> cachedData = cacheHandler.getFromCache(cacheKey, cacheName);
        if (cachedData != null) {
            return ResponseEntity.ok(cachedData);
        }
        StateSummary summary = stateSumRepo.findByStateIgnoreCase(state);
        Map<String, Object> summaryData = summary.getSummary();
        cacheHandler.putToCache(cacheKey, summaryData, cacheName);
        return ResponseEntity.ok(summaryData);
    }

    @GetMapping("/precinct-boundary/{state}")
    public ResponseEntity<Map<String, Object>> getPrecinctBoundary(@PathVariable String state) throws IOException {
        String cacheKey = state + PRECINCT_BOUNDARY_CACHE_KEY_SUFFIX;
        String cacheName = PRECINCT_CACHE;
        Map<String, Object> cachedData = cacheHandler.getFromCache(cacheKey, cacheName);
        if (cachedData != null) {
            return ResponseEntity.ok(cachedData);
        }
        PrecinctModel mapData= PrecinctRepo.findByStateIgnoreCase(state);
        Map<String, Object> jsonMap = objectMapper.convertValue(mapData, new TypeReference<Map<String, Object>>() {});
        cacheHandler.putToCache(cacheKey, jsonMap, cacheName);
        return ResponseEntity.ok(jsonMap);
    }

    @GetMapping("/district-boundary/{state}")
    public ResponseEntity<Map<String, Object>> getDistrictBoundary(@PathVariable String state) throws IOException {
        String cacheKey=state+DISTRICT_KEY_SUFFIX;
        String cacheName = DISTRICT_CACHE;
        Map<String, Object> cachedData = cacheHandler.getFromCache(cacheKey, cacheName);
        if (cachedData != null) {
            return ResponseEntity.ok(cachedData);
        }
        DistrictBoundary mapData= DistrictRepo.findByStateIgnoreCase(state);
        Map<String, Object> jsonMap = objectMapper.convertValue(mapData, new TypeReference<Map<String, Object>>() {});
        cacheHandler.putToCache(cacheKey, jsonMap, cacheName);
        return ResponseEntity.ok(jsonMap);
    }

    @GetMapping("/box-and-whisker/{state}/{type}/{regionForRace}")
    public ResponseEntity<Map<String, Object>> getBoxAndWhisker(@PathVariable String state, @PathVariable String type, @PathVariable String regionForRace) throws IOException {
        String cacheKey=state+type+regionForRace+BW_KEY_SUFFIX;
        String cacheName=BW_CACHE;
        Map<String, Object> cachedData = cacheHandler.getFromCache(cacheKey, cacheName);
        if (cachedData != null) {
            return ResponseEntity.ok(cachedData);
        }

        Map<String, Object> jsonData = null;
        if(type.equals("Race")){
            BoxAndWhiskerLAModel data=BoxAndWhiskRepo.findByStateIgnoreCaseAndTypeIgnoreCaseAndRegionIgnoreCase(state, type, regionForRace);
            jsonData = objectMapper.convertValue(data, new TypeReference<Map<String, Object>>() {});
        }
        if(type.equals("Income")){
            BoxAndWhiskerIncomeModel data=BoxAndWhiskRepoIncome.findByStateIgnoreCaseAndTypeIgnoreCaseAndRegionIgnoreCase(state, type, regionForRace);
            jsonData = objectMapper.convertValue(data, new TypeReference<Map<String, Object>>() {});
        }
        if(type.equals("Region")){
            BoxAndWhiskerRegionModel data=BoxAndWhiskRepoRegion.findByStateIgnoreCaseAndTypeIgnoreCaseAndRegionIgnoreCase(state, type, regionForRace);
            jsonData = objectMapper.convertValue(data, new TypeReference<Map<String, Object>>() {});
        }
        jsonData.remove("state");
        jsonData.remove("type");
        cacheHandler.putToCache(cacheKey, jsonData, cacheName);
        return ResponseEntity.ok(jsonData);
    }

    @GetMapping("/congressional-table/{state}")
    public Map<String, Object> getCongressionalTable(@PathVariable String state) {
        String cacheKey = state + CONGRESSIONAL_TABLE_CACHE_KEY_SUFFIX;
        String cacheName = CONGRESSIONAL_TABLE_CACHE;
        Map<String, Object> cachedData = cacheHandler.getFromCache(cacheKey, cacheName);
        if(cachedData != null) {
            return cachedData;
        }
        CongressionalTable congressTableData = congressTableRepo.findByStateIgnoreCase(state);
        Map<String, Object> jsonCongressionalData = congressTableData.getDistricts();
        cacheHandler.putToCache(cacheKey, jsonCongressionalData, cacheName);
        return jsonCongressionalData;
    }

    @GetMapping("/gingles/{selectedDisplay}/{state}/{race}")
    public ResponseEntity<Map<String, Object>> getGingles(@PathVariable String selectedDisplay, @PathVariable String state, @PathVariable String race) {
        String cacheKey;
        String cacheName = GINGLES_CACHE;
        // System.out.println(race);
        // System.out.println(selectedDisplay);
        // System.out.println(state);
        // if (!race.equals("overall")) {
            cacheKey = selectedDisplay + state + race + GINGLES_CACHE_KEY_SUFFIX;
        // }
        // else{
        //     cacheKey = selectedDisplay + state + GINGLES_CACHE_KEY_SUFFIX;
        // }
        Map<String, Object> cachedData = cacheHandler.getFromCache(cacheKey, cacheName);
        if(cachedData != null){
            return ResponseEntity.ok(cachedData);
        }
        // if (race.equals("overall")) {
        //     System.out.println("I CAME INTO HERE BECAUSE ITS OVERALL");
        //     GinglesIncomeData ginglesIncomeData = ginglesIncomeRepo.findByStateIgnoreCaseAndDataIgnoreCase(state, selectedDisplay);        
        //     Map<String, Object> ginglesSummary = objectMapper.convertValue(ginglesIncomeData, new TypeReference<Map<String, Object>>() {});
        //     cacheHandler.putToCache(cacheKey, ginglesSummary, cacheName);
        //     return ResponseEntity.ok(ginglesSummary);
        // }

        // System.out.println("I GET TO HERE AT LEAST");
        // System.out.println(state);
        // System.out.println(selectedDisplay); 
        GinglesData ginglesData = ginglesRepo.findByStateIgnoreCaseAndDataIgnoreCaseAndRaceIgnoreCase(state, selectedDisplay, race);
        // System.out.println(ginglesData);
        Map<String, Object> ginglesSummary = objectMapper.convertValue(ginglesData, new TypeReference<Map<String, Object>>() {});
        cacheHandler.putToCache(cacheKey, ginglesSummary, cacheName);
        return ResponseEntity.ok(ginglesSummary);
    }

    @GetMapping("/ensemble-summary/{state}/{ensemble}")
    public ResponseEntity<Map<String, Object>> getEnsembleSummary(@PathVariable String state, @PathVariable String ensemble) throws IOException {
        String cacheKey=state+ensemble+ENSEMBLE_SUMMARY_DATA_SUFFIX;
        String cacheName=ES_CACHE;
        Map<String, Object> cachedData = cacheHandler.getFromCache(cacheKey, cacheName);
        if (cachedData != null) {
            return ResponseEntity.ok(cachedData);
        }

        EnsembleSummaryBarGraph mapData= EnsembleSummaryRepo.findByStateIgnoreCaseAndEnsembleIgnoreCase(state, ensemble);
        Map<String, Object> jsonMap = objectMapper.convertValue(mapData, new TypeReference<Map<String, Object>>() {});
        cacheHandler.putToCache(cacheKey, jsonMap, cacheName);
        return ResponseEntity.ok(jsonMap);
    }

    @GetMapping("/ecologicalinference/{selectedDisplay}/{state}/{race}/{candidate}/{region}")
    public ResponseEntity<Map<String, Object>> getEcologicalInference(@PathVariable String selectedDisplay, @PathVariable String state, @PathVariable String race, @PathVariable String candidate, @PathVariable String region) throws IOException {
        String cacheKey;
        String cacheName = ECOINFERENCE_CACHE;
        cacheKey = selectedDisplay + state + race + candidate + region + ECOINFERENCE_CACHE_KEY_SUFFIX;
        Map<String, Object> cachedData = cacheHandler.getFromCache(cacheKey, cacheName);
        if (cachedData != null) {
            return ResponseEntity.ok(cachedData);
        }
        EcologicalInference ecoData= EcoInferenceRepo.findByStateIgnoreCaseAndRaceIgnoreCaseAndCandidateIgnoreCaseAndTypeIgnoreCaseAndRegionIgnoreCase(state, race, candidate, selectedDisplay,region);
        Map<String, Object> jsonEco = objectMapper.convertValue(ecoData, new TypeReference<Map<String, Object>>() {});
        cacheHandler.putToCache(cacheKey, jsonEco, cacheName);
        return ResponseEntity.ok(jsonEco);
    }

    @GetMapping("/Data/colors/{category}")
    public Map<String, String> getColors(@PathVariable String category) {
        try {
            ClassPathResource resource = new ClassPathResource("colors/" + category.toLowerCase() + ".json");
            Map<String, String> colorObj=objectMapper.readValue(resource.getInputStream(), Map.class);
            return colorObj;
        } catch (IOException e) {
            e.printStackTrace();
            return Map.of(); 
        }
    }
}

