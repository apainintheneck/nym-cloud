/*global $*/
/*global fetch*/
//Load default word data from external file.
import { defaultData, defaultWord } from "./data.js";

$(document).ready(function(){
    const apiKey = "0a4a967d-fbcb-424d-9e52-b06b00ca52cb";
    var data = defaultData; //Load default data.
    var prevWord = defaultWord; //Load previous word.
    
    //Display default word data.
    displayData(defaultWord);
    
    //---Event Listeners---
    //For enter word text box.
    $("#text-box").on("submit", function(event){
        //Prevent default action of form to reload page.
        event.preventDefault();
        
        let newWord = $("#input-word").val();
        
        //Return if entered word equals the previous word or the displayed word.
        if(newWord === prevWord){
            return;
        } else if(newWord.toUpperCase() === $("#word-title").text()){
            $("#wordErrAlert").html("");
            prevWord = newWord;
        } else {
            prevWord = newWord;
        }
        
        if(!isWordValid(newWord)) return;
        
        loadData(newWord);
    });
    
    //For clickable synonyms and antonyms buttons.
    $(document).on("click", ".word-btn", function(){
        $("#input-word").val($(this).text());
        loadData($(this).text());
    });
    
    //For usage dropdown menu.
    $("#word-usage").on("change", function(){
        displayDefinitions();
        displaySynonyms();  
        displayAntonyms();
    });
    
    //For definitin dropdown menu.
    $("#definition").on("change", function(){
        displaySynonyms();  
        displayAntonyms();
    });
    
    //---Functions---
    //Checks to make sure string is not empty  and doesn't contain numbers.
    function isWordValid(word) {
        if(word !== "") {
            for(let i = 0; i < word.length; i++) {
                if(word[i] >= "0" && word[i] <= "9") {
                    $("#wordErrAlert").html("Enter a valid word.");
                    return false;
                }
            }
        } else {
            $("#wordErrAlert").html("");
            return false;
        }
        
        $("#wordErrAlert").html("");
        return true;
    }
    
    //Load data from API based upon word.
    async function loadData(word) {
        let url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${apiKey}`;
        let response = await fetch(url);
        let newData = await response.json();
        // console.log(newData); //For testing purposes only
        
        //Check Data
        if(newData.length === 0 || (typeof newData[0]) === "string") {
            $("#wordErrAlert").html("Unable to find word. Try another one.");
            return;
        } else {
            //Make sure that a matching word was returned from the database.
            for(let i = 0; i < newData.length; i++){
                if(newData[i].meta.id === word.toLowerCase()){
                    data = newData;
                    displayData(word, data);
                    return;
                }
            }
            
            $("#wordErrAlert").html("Unable to find word. Try another one.");
            return;
        }
    }
    
    //Display data recieved from API.
    function displayData(word) {
        //Display word.
        $("#word-title").html(`<u>${data[0].meta.id.toUpperCase()}</u>`);
        
        //Display dropdown menu of usages.
        $("#word-usage").html("");
        for(let i = 0; i < data.length; i++){
            if(data[i].meta.id === word) {
                $("#word-usage").append(`<option value="${i}"> ${data[i].fl} </option>`);
            }
        }
        
        displayDefinitions();
        displaySynonyms();  
        displayAntonyms();
    }
    
    //Display dropdown menu of definitions based upon word usage.
    function displayDefinitions() {
        let usageIndex = Number($("#word-usage").val());
        
        $("#definition").html("");
        for(let i = 0; i < data[usageIndex].shortdef.length; i++) {
            $("#definition").append(`<option value="${i}"> ${data[usageIndex].shortdef[i]} </option>`);
        }
    }
    
    //Display synonyms as clickable set of buttons.
    function displaySynonyms() {
        let usageIndex = Number($("#word-usage").val());
        let defIndex = Number($("#definition").val());
        
        
        $("#synonyms-text").html("");
        //Validate that synonym array exists.
        if(data[usageIndex].meta.syns.length <= defIndex) {
            $("#synonyms-text").append(`None Found.`);
        } else { //Add synonyms
            for(let i = 0; i < data[usageIndex].meta.syns[defIndex].length; i++) {
                $("#synonyms-text").append(`<button type="button" class="btn btn-outline-primary word-btn">${data[usageIndex].meta.syns[defIndex][i]}</button>`);
            }
        } 
    }
    
    //Display antonyms as clickable set of buttons.
    function displayAntonyms() {
        let usageIndex = Number($("#word-usage").val());
        let defIndex = Number($("#definition").val());
        
        $("#antonyms-text").html("");
        //Validate that antonym array exists.
        if(data[usageIndex].meta.ants.length <= defIndex) {
            $("#antonyms-text").append(`None Found.`);
        } else { //Add antonyms
            for(let i = 0; i < data[usageIndex].meta.ants[defIndex].length; i++) {
                $("#antonyms-text").append(`<button type="button" class="btn btn-outline-danger word-btn">${data[usageIndex].meta.ants[defIndex][i]}</button>`);
            }
        }
    }

});