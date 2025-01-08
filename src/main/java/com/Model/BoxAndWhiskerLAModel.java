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
public class BoxAndWhiskerLAModel {
    private String state;
    private String type;
    private String region;
    private Map<String, Object> White;
    private Map<String, Object> Black;
    private Map<String, Object> Asian;
    private Map<String, Object> Native;
    private Map<String, Object> Pacific;
    private Map<String, Object> Other;
}
