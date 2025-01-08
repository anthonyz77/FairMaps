package com.Model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ginglesDbData")
public class GinglesIncomeData {
    @Id
    private String id;
    private String state;
    private String data;
    private List<String> fields;
    private List<List<Double>> precincts;
    private List<List<Double>> regression_points;
}