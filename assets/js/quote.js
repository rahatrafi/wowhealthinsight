jQuery(document).ready(function(){   
    if(!jQuery.isEmptyObject(data)) {  
        getData();
    }
});


const steps = [
    { title: 'When would you like coverage?', code: 'coverage' },
    { title: 'What benefits are most important to you?', code: 'benefits' },
    { title: 'Are you currently enrolled in Medicare Parts A or B?', code: 'enrolled' },
    { title: 'What is your gender?', code: 'gender' },
    { title: 'Have you used Tobacco Products within the last 12 months?', code: 'tobacco' },
    { title: 'What is your date of birth?', code: 'dob' },
    { title: 'What is your zip code?', code: 'zip' },
    { title: 'Are you receiving benefits from New York Medicaid, also known as Medicaid Managed Care?', code: 'medicaid' },
    { title: 'Do you have 3 or prescriptions', code: 'prescriptions' },
    { title: 'What is your name?', code: 'name' },
    { title: 'What is your email?', code: 'email'},
    { title: 'Last step! Your results are ready. Mobile or home phone number.', code: 'mobile'}
];

addEventListener('hashchange', (event) => { 
    var step = location.hash;
    step = step.replace("#", "");
});

function setData(stepData, currPage, prev, next) {
    window.location.hash = '#'+next;
    var uData = data;
    var completed_steps = uData.completed_steps+1;
    var person = 
    { 
        userData: { 
            [currPage] : stepData
        },
        currPage: currPage,
        prevPage: prev,
        nextPage: next,
        completed_steps: completed_steps
    }
    
    Object.assign(uData.userData, {[currPage] : stepData} );
    Object.assign(uData, {currPage : currPage}, {prevPage: prev}, {nextPage: next}, {completed_steps: completed_steps}  );
    // window.localStorage.setItem('user_wow_health', JSON.stringify(uData));
    $.ajax({
        type : "POST",
        url : "step",
        contentType : "application/json",
        xhrFields: {
            withCredentials: true
         },
        data : JSON.stringify(person),
        success: (data) => {
            $('.main-container').html(data);
            progress(completed_steps)
        }
    });
}

function getData() {
    var userData = data;
    // var userDataLen = data.length;
    // if(userDataLen > 0) {
        loader();
        if(userData.prevPage) {
            step(userData.nextPage);
            progress(userData.completed_steps);
        } else {
            if(userData.completed_steps == 1)
            {
                step(userData.nextPage);
            } else {
                step(userData.currPage);
            }
            
            progress(userData.completed_steps);
        }
        
    // }
    
}

function step(nextPage) {
    getStepAjax(nextPage);
}

function getStepAjax(step) {
    
    $.ajax({
        type : "POST",
        url : "step",
        contentType : "application/json",
        xhrFields: {
            withCredentials: true
         },
        data : JSON.stringify(data),
        success: (data) => {
            $('.main-container').html(data);
        }
    });
}

function loader() {
}

function progress(valeur) {
    valeur = valeur * 9.09;
    $('.progress-bar').css('width', valeur+'%').attr('aria-valuenow', valeur);  
}

function setCoverageData(val) {
    setData(val, 'coverage', '', 'benefits');
}

function setBenefitsData() {
    const totalChecked = jQuery("[name='benefits[]']:checked").length;
    if(totalChecked > 0) {
        var list = $("input[name='benefits[]']:checked").map(function () {
            return this.value;
        }).get();
        setData(list, 'benefits', 'coverage', 'medicare');
    } else {
        $("input[name='benefits[]']").addClass('is-invalid');
        // return false;
    }
    
}

function setMediCareData() {
    const totalChecked = jQuery("[name='medicare']:checked").length;
    if(totalChecked > 0) {
        var resMedicare = $("input[name='medicare']:checked").val();
        setData(resMedicare, 'medicare', 'benefits', 'gender');
    } else {
        return false;
    }
    
}

function setGenderData() {
    const totalChecked = jQuery("[name='gender']:checked").length;
    if(totalChecked > 0) {
        var resMedicare = $("input[name='gender']:checked").val();
        setData(resMedicare, 'gender', 'medicare', 'tobacco');
    } else {
        return false;
    }
    
}

function setTobaccoData() {
    const totalChecked = jQuery("[name='tobacco']:checked").length;
    if(totalChecked > 0) {
        var resMedicare = $("input[name='tobacco']:checked").val();
        setData(resMedicare, 'tobacco', 'gender', 'dob');
    } else {
        return false;
    }
    
}

function setDobData() {
    jQuery('.month, .date, .year').removeClass('is-invalid');
    var month = jQuery(".month").val();
    var date = jQuery(".date").val();
    var year = jQuery(".year").val();
    if(month && date && year) {
        var error = false;
        if( month > 12 )
        {
            error = true;
            jQuery('.month').addClass('is-invalid');
        }
        if(date > 31) {
            error = true;
            jQuery('.date').addClass('is-invalid');
        }
        if(year <= 1980) {
            error = true;
            jQuery('.year').addClass('is-invalid');
        } 

        if(error === false) {
            jQuery('.month, .date, .year').removeClass('is-invalid');
            var dob = month+'-'+date+'-'+year;
            setData(dob, 'dob', 'tobacco', 'zip');
        }
        
    } else {
        
        if(month == '' || month > 12)
        {
            jQuery('.month').addClass('is-invalid');
        } else {
            jQuery('.month').removeClass('is-invalid');
        }

        if(date == '' || date > 31)
        {
            jQuery('.date').addClass('is-invalid');
        } else {
            jQuery('.date').removeClass('is-invalid');
        }

        if(year == '' || year <= 1980)
        {
            jQuery('.year').addClass('is-invalid');
        } else {
            jQuery('.year').removeClass('is-invalid');
        }

        return false;
    }
}

function setZipData() {
    var zip = jQuery("#zipcode").val();
    jQuery("#zipcode").removeClass('is-invalid');
    var regex = /^\d{5}(?:-\d{4})?$/.test(zip);
    if(regex) {
        setData(zip, 'zip', 'dob', 'prescriptions'); 
    } else {
        jQuery("#zipcode").addClass('is-invalid');
        return false;
    }
}

/*function setMediCaidData(validate) {
    if(validate) {
        const totalChecked = jQuery("[name='medicaid']:checked").length;
        if(totalChecked > 0) {
            var resMedicaid = $("input[name='medicaid']:checked").val();
            setData(resMedicaid, 'medicaid', 'zip', 'prescriptions');
        } else {
            return false;
        }
    } else {
        setData('NULL', 'medicaid', 'zip', 'prescriptions');
    }
    
}*/

function setPrescriptionData(validate) {
    if(validate) {
        const totalChecked = jQuery("[name='prescriptions']:checked").length;
        if(totalChecked > 0) {
            var resPrescriptions = $("input[name='prescriptions']:checked").val();
            setData(resPrescriptions, 'prescriptions', 'zip', 'name');
        } else {
            return false;
        }
    } else {
        setData('NULL', 'prescriptions', 'zip', 'name');
    }
    
}

function setNameData() {
    jQuery("#fname, #lname").removeClass('is-invalid');
    var fname = jQuery("#fname").val();
    var lname = jQuery("#lname").val();
    if(fname && lname) {
       const uData = {
            first_name: fname,
            last_name: lname
       }
       setData(uData, 'name', 'prescriptions', 'email');
    } else {

        if(fname == ''){
            jQuery("#fname").addClass('is-invalid');
        } else {
            jQuery("#fname").removeClass('is-invalid');
        }

        if(lname == ''){
            jQuery("#lname").addClass('is-invalid');
        } else {
            jQuery("#lname").removeClass('is-invalid');
        }
        return false;
    }
}

function setEmailData(validate) {
    jQuery("#email").removeClass('is-invalid');
    var email = jQuery("#email").val();
    if(validate) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(regex.test(email)) {
            setData(email, 'email', 'name', 'mobile');
        } else {
            jQuery("#email").addClass('is-invalid');
            return false;
        }
    } else {
        setData('NULL', 'email', 'name', 'mobile');
    }
    
}

function setMobileData() {
    jQuery("#mobile").removeClass('is-invalid');
    var mobile = jQuery("#mobile").val();
    var mb = mobile.replace(/_/g, '').replace(/-/g, '').replace('(', '').replace(')', '');
    if(mobile && mb.length == 10) {
        setData(mobile, 'mobile', 'email', 'congrats');
    } else {
        jQuery("#mobile").addClass('is-invalid');
        return false;
    }
}

function seeResults() {
    // console.log('all done');
    jQuery("#openTel").click();
}