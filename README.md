# Preview
This is a website for storing results from football games either from real football games or games such as FIFA.  
An instance of this website is currently running live https://resultsnet.online.

To see an example of a profile I have used personally see my [profile](https://resultsnet.online/results/user/KTBM).  
This example contains football seasons both from real life teams I have played in within Wellington as well as teams I have used in the video game FIFA. This profile cannot be edited or changed as you wont be logged in as the user KTBM.

However you can create an account and login or login with a username of "testuser" and a password of "testuser".
# What is ResultsNet
ResultsNet allows you to record football results in a structured manner. Such that the results are grouped by the competition, the competitions are grouped by the season and the seasons are grouped by the career (or collection if the makes more sense). The website will display one season at a time which will then display all the competitions and hence all the results that were contained within that season. Each competition will also have statistics recorded such as wins, losses, goals and more. [Here](https://resultsnet.online/results/user/KTBM/0e3330a8-71cf-4938-aca4-d525c79a4029/1dc9ac48-f990-4494-8105-92af01d75b8c) is an example of a currently ongoing season for team I play for this year (the team being Lower Hutt City AFC Fourplay). The design for the website is largely based on how professional football teams results are stored on [wikipedia](https://en.wikipedia.org/wiki/2016%E2%80%9317_Chelsea_F.C._season#Competitions).
# Development
ResultsNet uses .NET 6.0 for the backend API with the front end developed using react as a framework. All the data is stored on a mysql database with entity framework core 6 acting as the database access framework or ORM. The live example of the website is run on docker using a docker image and served via nginx.
# What I Learned
* How to create custom middleware in a .NET API
* How to map objects to a database using entity framework
* How to execute queries with stored procedures
* How to keep users logged in from session to session using JSON web tokens.
# How to use ResultsNet
### Create an account
Register with a username and password combination and use this to login.
### Create a Career
A career acts a container for a collection of seasons.  
* To create a career click on the tab which says "Filter by Career" then click "Add Career".  
* Fill in the the forms inputs and click "Add".
### Create a Season
A season is what will contain and display all the competitions and results which apply to a particular season.  
* To create a season click on the tab which says "Filter by Season" then click "Add Season".  
* Fill in the the forms inputs and click "Add".  
* A career must be selected before a season can be added.  
### Create a Competition
A competition is used to record results that occured within a particular competition. This is useful as often football teams will play in multiple competitions per season and these competitions will likely have different formats.
* With a career and season currently selected click the "+ Add Competition" button. 
* Give the competition a name.  
* Select a format. A format is what decides what label a result should have based on how many games in the result is (eg whether a game should be labeled a semi-final, final, or a number corresponding with the round of the competition). By default there a a format called "Generic League" which is for the most common round robben style competition which gives every result a label based purely on the order of the result (e.g the 5th result will be given the label "5"). To create a custom format see below.  
* Enter a Start At value. The "Start At" field represents based on the format how many games in the results should start. This is useful as often teams do not enter a competition at the very start of it. By default this value is 1 and should stay this value unless the team didn't enter the competition untill after the first round.
* Click "Add".
### Add Results
Results represents the result of the game. The home team name and score is displayed on the left hand side while the away team name and score are displayed on the right hand side.
* Set the venue of the game by clicking the dropdown that will either say "Home" or "Away". Set this dropdown to either of the two options.
* Enter the opposition team name in the wider input.
* Enter goals that each team scored in the smaller inputs.
* If the game is a replay (such as an FA Cup replay) then tick the checkbox on the right hand side.
* Click the plus button.
* The results order can be adjusted by dragging and dropping the result to the desired position.
### Create a custom competition format
* With a career and season currently selected click the "+ Add Competition" button.
* Click the "Select Format" dropdown.
* Click "Create Format".
* Enter a format name.
* Enter a position and an output. The position represents how many games in the result must be for the output to be applied to the results label. For example if the position is 5 and the output is "Round 5" then the 5th result of the competition will have the label "Round 5" applied to it. Click the + button to add more options or click save to save the format.
  
There are more dynamic ways the labels can be applied to results based on position.
For the position field there are 3 types of values.
#### Single position
This means any number entered will effect the label of the result in the position corresponding with the entered number. For example entering a position value of 1, 3, 10 or 15 will effect the label of the result in the 1st, 3rd, 10th or 15th position of the competition respectively.
#### Range position
Some examples of a range position could be 1-6, 1-2, 5-6, 11-15.
Using a range will effect the label of results which were entered within a particular range of positions in the competition inclusively. For example if the range 1-6 is entered then all results from the 1st result to the 6th result will have it's label effected by whatever the corresponding output is.
#### Wildcard position
A wildcard position is when the * character is entered in the position input.
The wildcard position effects every result that is not already covered by either the single position or range position. For example if use a position of * and an output of "game" then every result with have the label "game" applied to it.
#### Using [P] in the output field
By using [P] in the output field all instances of [P] will be replaced by a number representing the position that a results was entered in. For example if a format has a position value of "10", and an output value of "Round [P]" then the 10th results of the competition would have the label "Round 10" applied to it
#### Examples
As this can be confusing what can be best is to simply look at some examples of how formats for some popular football competitions would be constructed.
1. [Premier League](https://i.gyazo.com/f0777abc1e687ab9e130851ccc9a2df3.png)
2. [Champions League](https://i.gyazo.com/7e67198311298b07e52c6c376ab5e26a.png)
3. [FA Cup](https://i.gyazo.com/7cb5ad53a53e0ffb380d7bc2cf4cdec4.png)
