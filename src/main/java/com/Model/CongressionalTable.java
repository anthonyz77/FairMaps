package com.Model;

import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "congressionalTableData")

public class CongressionalTable {

    @Field("state")
    private String state;
    private Map<String, Object> districts;
}