const form = document.getElementById('fitnessForm')
const result = document.getElementById('result');
result.innerHTML = '';

const firstNameE = document.getElementById('firstName');
const lastNameE = document.getElementById('lastName');
const emailE = document.getElementById('email');
const ageE = document.getElementById('age');
const heightE = document.getElementById('height');
const weightE = document.getElementById('weight');
const systolicE = document.getElementById('systolic');
const diastolicE = document.getElementById('diastolic');
const bodyFatE = document.getElementById('bodyFat');
const button = document.getElementById('sendInfo');

//Reading data from JSON file

function loadJSONFile(filePath) {
  const request = new XMLHttpRequest();
  request.open('GET', filePath, false); // `false` makes it synchronous
  request.send(null);

  if (request.status === 200) {
      return JSON.parse(request.responseText);
  } else {
      console.error('Error loading JSON:', request.status);
      return null;
  }
}

//Loading data from men and women

 function getBodyFatCategory(age, bodyFatPercentage, gender) {
  let bodyFatData =""
  if(gender === 'male'){
    bodyFatData =  loadJSONFile('BFM_table.json');
  } else {
    bodyFatData = loadJSONFile("BFW_table.json");
  }

 //Getting category 

  const ageGroup = bodyFatData.find(group => {
      const [minAge, maxAge] = group.ageRange.split('-').map(Number);
      return age >= minAge && age <= maxAge;
  });

  if (!ageGroup) return "Ungültige Altersgruppe";

  for (const [category, range] of Object.entries(ageGroup)) {
      if (category !== "ageRange" && bodyFatPercentage >= range.min && bodyFatPercentage <= range.max) {
          return category;
      }
  }

  return "Unbekannter Körperfettanteil";
}

//Blood pressure searching and catching data

function getBloodPressureCategory(systolic, diastolic) {
  const bloodPressureTable = loadJSONFile('BD_table.json')

  const category = bloodPressureTable.find(
      range =>
          systolic >= range.systolic.min && systolic <= range.systolic.max &&
          diastolic >= range.diastolic.min && diastolic <= range.diastolic.max
  );

  return category ? category.category : "Ungültiger Blutdruckwert";
}

//BMI calculation

function calculateBMI(weight, height){
  const bmi = weight / ((height / 100) ** 2);
  return bmi.toFixed(1)
}

//BMI searching and catching data 

function getBMICategory(bmiResult, age) {
  const bmiTable =  loadJSONFile('BMI_table.json')
  const category = bmiTable.find(
      range =>
          bmiResult >= range.minBMI &&
          bmiResult <= range.maxBMI &&
          age >= range.minAge &&
          age <= range.maxAge
  );

   return category ? category.category : "Ungültiger data"
  
}

//Form validation

function validateForm(currentElement, message){
  const alertMsg = document.createElement('small');
  alertMsg.innerHTML = message;
  currentElement.after(alertMsg);
  currentElement.style.border = 'solid 1px red';
  alertMsg.style.color = 'red'
  return false;
}

//Main function 

function fitnessCheck(){
    const firstName = firstNameE.value;
    const lastName = lastNameE.value;
    const email = emailE.value;
    const ageValue = parseInt(ageE.value);
    const height = parseInt(heightE.value);
    const weight = parseInt(weightE.value);
    const systolic = parseInt(systolicE.value);
    const diastolic = parseInt(diastolicE.value);
    const bodyFat = parseInt(bodyFatE.value);
    const gender = document.querySelector('input[name="gender"]:checked').value;


    if (firstName === "") {
        return validateForm(firstNameE, "Vorname muss ausgefüllt werden");
      }

    if (lastName === "") {
        return validateForm(lastNameE, "Nachname muss ausgefüllt werden");
      }

      if (email === "") {
        return validateForm(emailE,"E-mail muss ausgefüllt werden" );
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return validateForm(emailE, "Email hat ungültiges Format" );
      }

      if (isNaN(ageValue) || ageValue < 1 || ageValue > 120) {
        return validateForm(ageE, "Zahl muss zwischen 1 und 120 liegen");
      }

      if (isNaN(height) || height < 50 || height > 250) {
        return validateForm(heightE, "Zahl muss zwischen 50 und 250 liegen");  
      }
      if (isNaN(weight) || weight < 1 || weight > 250) {
        return validateForm(weightE, "Zahl muss zwischen 1 und 250 liegen");
      }

      if (isNaN(systolic) || systolic < 30 || systolic > 180) {
        return validateForm(systolicE, "Zahl muss zwischen 30 und 180 liegen" );
      }

      if (isNaN(diastolic) || diastolic < 30 || diastolic > 180) {
        return validateForm(diastolicE, "Zahl muss zwischen 30 und 180 liegen");
      }

      if (isNaN(bodyFat) || bodyFat < 1 || bodyFat > 100) {
        return validateForm(bodyFatE, "Zahl muss zwischen 1 und 100 liegen");   
      }

      const  resultBmi = calculateBMI(weight, height);
      const bmiCategory = getBMICategory(resultBmi, ageValue);
      const getBloodPressure = getBloodPressureCategory(systolic, diastolic);
      const bodyFatCategory = getBodyFatCategory(ageValue, bodyFat, gender);
      const cssBloodPressureDot = getBloodPressure.replaceAll('.', '')
      const cssBloodPressure = cssBloodPressureDot.replaceAll(' ', '')
      const cssBodyFat = bodyFatCategory.replaceAll(' ', '')
      
      form.style.display = 'none';
      result.innerHTML=`
      <p class ="${cssBodyFat}">Berechneter BMI:${bmiCategory}</p>
      <p class ="${cssBloodPressure}">Blutdruckwert:${getBloodPressure}</p>
      <p class ="${bodyFatCategory}">Körperfettanteil:${bodyFatCategory}</p>
      <button onclick = "tryAgain()">Versuchen Sie noch ein mal</button>`
}

//Button function

function tryAgain(){
  form.style.display = 'flex'
  result.style.display ='none'
}

