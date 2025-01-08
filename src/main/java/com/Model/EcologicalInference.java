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
@Document(collection = "ecologicalInference")
public class EcologicalInference {
    private String state;
    private String race;
    private String candidate; 
    private List<Object> data; 
    private String type;
    private String region;
}
