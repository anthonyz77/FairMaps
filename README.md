# FairMaps
FairMaps is a website that shows the analysis of gerrymandering in certain states in the United States. 

The user will first pick an available state from the displayed map of the United States, which will prompt the website to show a close up on the specific state and display a summary page of all demographic, income, geographical, and voting data regarding that state in a readble format. There are carefully labeled tabs which all show a multitude of bar graphs, charts, kernel density graphs, and box and whisker graphs that show how populations of certian races, regions, or income levels vote at the precint level.  

Additionally to the existing data, analysis is done on an ensemble of randomly generated district plans generated with multicore processing on [Seawulf](https://it.stonybrook.edu/services/high-performance-computing), Stony Brook University's High Performance Computer Cluster (HPC Cluster). These plans are generated using existing data and using that with [MGGG's Recom Algorithm](https://github.com/mggg/GerryChain) which represents each precint in a state as a node apart of an adjacency graph and constantly spltis the ndoes in an attempt to make a more balanced distict plan that is not gerrymandered.

### 📂 Features:
- **State Summary Tab**: Users view the summary of all demographic, income, geographical, and voting data assocatiaed with their selected state in a readable UI with bar graphs.
- **Congressonal Table Tab**: Users can view a table which displays all the district representatives and the demographic, income, geographical, and voting data associated with each district.
- **Heat Map Options**: Users can select display options for the map of the state which can show heat maps and a legend based on demographics, income, geographical, and voting data of a state at the precint level.
- **Gingles 2/3 Analysis Tab**: Users can view the precinct voting analysis which shows scatterplots of how which party different demographics, income levels, and geographical region types (rural, suburban, urban) voted for. 
- **Ecological Inference Analysis Tab**: Users can view kernel density graphs which show how likely different demographics, income levels, and geographical region type groups and their counter parts would vote for a specific candidate. 
- **Ensemble Summary Tab**: Users can view bar graphs which shows the democratic/republican district splits within the 15,000 randomly generated district plans mentioned above.
- **Ensemble Analysis Tab**: Users can view box and whisker graphs which show how the currently enacted district plan in the state compares to the 15,000 randomly generated district plan ensemble in terms of the demographic, income level, and geographical region types within each district.

### 🔧 Tech Stack:
- **Frontend**: React.js, JavaScript, HTML, CSS, Chart.js, React-plotly.js, Leaflet.js
- **Backend**: Java Spring Boot
- **Database**: MongoDB (Mongoose), Redis Cache
- **Data Preprocessing**: Python Pandas, [MGGG's Maup Library](https://github.com/mggg/maup)

### 🚀 Running the project:
To run the project locally, follow these steps:

1. Clone the repository:
   - git clone https://github.com/anthonyz77/FairMaps.git
   
3. The required dependencies are in package.json. Install the dependencies:
   - npm install

4. Start the mongoDB database and start mongosh
   
   ⚠️ Important Note About Data:
   - This project relies on data which is currently stored locally on my machine and is not included in this repository. The data is necessary for the application to function correctly and display content on the website. Without the data certain graphs will not display and certain statistics will show default values.

   Why is the data missing?
   - This project was originally configured to use a cloud MongoDB database for storing and retrieving data. However, the cloud database has been decommissioned to avoid ongoing costs and maintenance, which means the application will not display the intended data when run locally.
   
   Example data:
   - Example JSON files that represent the data that was originally stored in the cloud database are provided in the public folder of the repository.

6. Start the Java Spring Boot backend server:
   - Make sure to have both Java and Maven installed

   - mvn clean package
   - mvn spring-boot:run
  
8. Start client side webpage:
   - npm start
