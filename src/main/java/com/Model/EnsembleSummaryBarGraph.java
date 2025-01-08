package com.Model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ensembleSummary")
public class EnsembleSummaryBarGraph {
    private String state;
    private String ensemble;
    private int total_plans;
    private Map<String, Object> summary_data;
}
