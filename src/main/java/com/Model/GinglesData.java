package com.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ginglesDbData")
public class GinglesData {
    @Id
    private String id;
    private String state;
    private String data;
    private String race;
    private List<String> fields;
    private Map<String,Object> precincts;
    private List<List<Double>> regression_points;
}