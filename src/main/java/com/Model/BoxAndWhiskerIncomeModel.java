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
@Document(collection = "boxAndWhiskers")
public class BoxAndWhiskerIncomeModel {
    private String state;
    private String type;
    private String region;
    private Map<String, Object> Low_Income;
    private Map<String, Object> Medium_Income;
    private Map<String, Object> High_Income;
}
