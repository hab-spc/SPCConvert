
var incorrectCount = 0;
var incorrectArr = [];
var currClass = 0;
var annotClass = 0;
var classText = "";


$('.progress').fadeOut(1);

// Debouncer to throttle event triggers
function debouncer( func , timeout ) {
	var timeoutID , timeout = timeout || 200;
	return function () {
		var scope = this , args = arguments;
		clearTimeout( timeoutID );
		timeoutID = setTimeout( function () {
			func.apply( scope , Array.prototype.slice.call( args ) );
		} , timeout );
	}
};


function updateDetailImage(data) {

	if (!imageDetailActive)
		return;

	//var cameraIndex = camera.val();
	var siteURL = '';

	var base_url = siteURL+data.image_url;
	var image_url = base_url + image_ext;
	$('#TargetImg').attr("src",image_url);
	// Compute Image size from ImageDetail Container
	var aspectRatio = data.image_height/data.image_width;
	var heightScale = $('#ImageDetail').height()/data.image_height;
	var widthScale = $('#ImageDetail').width()/data.image_width;
	if (data.image_width*heightScale > 0.6*$('#ImageDetail').width()) {
		// Scale Image by width
		$('#TargetImg').width(0.6*$('#ImageDetail').width());
		$('#TargetImg').height(0.6*$('#ImageDetail').width()*aspectRatio);
	}
	else {
		$('#TargetImg').height(0.75*$('#ImageDetail').height());
		$('#TargetImg').width(0.75*$('#ImageDetail').height()/aspectRatio);

	}
	var scaleInfo = data.image_width*res;
	$('#ScaleBar').html(scaleInfo.toPrecision(3) + " mm");
	$('#ScaleBar').width($('#TargetImg').width());
	$('#ImageDetailTitle').html(image_url);

	// Info
    var classes = {};
    classes[0] = "Other";
    classes[1] = "Prorocentrum";
	//console.log(data);
	$('#ImageName').html("<h5 class='info-label'>Image ID</h5>" + "<h4>" + data.image_id + "</h4>");
	$('#Timestamp').html("<h5 class='info-label'>Collection Datetime</h5>" + "<h4>" + data.image_timestamp + "</h4>");
    $('#class-lbl').html("<h5 class='info-label'>Class Label </h5>" + "<h4>" + classes[data.pred] + " </h4>");
    $('#PredictedProb').html("<h5 class='info-label'>Predicted Probabilities </h5>");
    $('#ProbOther').html("<h4 class='info-label'>Other</h4>" + "<h4>" + data.prob_non_proro + "</h4>");
    $('#ProbProro').html("<h4 class='info-label'>Prorocentrum</h4>" + "<h4>" + data.prob_proro + "</h4>");
};

function showImageDetail(data) {
	// Otherwise show image detail
	//var data = this.roi_data;
	siteURL = '';
	var base_url = siteURL+data.image_url;

	imagePostfixIndex = 0;
	imageDetailActive = true;
	updateDetailImage(data);
	$('#DownloadImage').on('click', data, function (event) {
		imagePostfixIndex = 3;
		var link = document.createElement('a');
		var image_url = siteURL + event.data.image_url + image_ext;
		//$('#TargetImg').attr("src",image_url);
		link.id = 'dnld_image';
		link.href = image_url;
		link.download = image_url;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

	});
	$('#ShowImage').on('click', data, function (event) {
		imagePostfixIndex = 0;
		var image_url = siteURL + "/static/" + event.data.image_url + image_ext;
		$('#TargetImg').attr("src",image_url);
	});
	$('#ShowBinaryImage').on('click', data, function (event) {
		imagePostfixIndex = 1;
		var image_url = siteURL + event.data.image_url + '_binary.png';
		$('#TargetImg').attr("src",image_url);
	});
	$('#ShowRawColor').on('click', data, function (event) {
		imagePostfixIndex = 1;
		var image_url = siteURL + event.data.image_url + '_rawcolor' + image_ext;
		$('#TargetImg').attr("src",image_url);
	});
	/*$('#ShowBoundaryImage').on('click', data, function (event) {
		imagePostfixIndex = 2;
		var image_url = siteURL + event.data.image_url + imagePostfix[imagePostfixIndex];
		$('#TargetImg').attr("src",image_url);
	});*/
	// Add event listener for window
	$(window).resize(debouncer (function() { return updateDetailImage(data);}));
	//$(window).resize(function() { return updateDetailImage(data);});
	$('#ImageDetail').modal();

};

function buildImageMosaic(imageItems) {
    
    loadedCounter = 0;
    $('#loading-progress').removeClass('progress-bar-striped');
    $('#MosaicContainer').empty();
    
    
    for ( var i = 0; i < imageItems.length; i++ ) {
        var elem = getItemElement(imageItems[i]);
        $('#MosaicContainer').append(elem);
        loadedCounter++;
        //elem.style.backgroundImage = "url('"+img.src+"')";
        var pct = Math.floor(100*loadedCounter/imageItems.length);
        $('#loading-progress').width(pct.toString()+"%");
        if (loadedCounter >= imageItems.length) {
            $('#loading-progress').html('Finished');
            $('.progress').fadeOut(4000);
        }
        else {
            $('#loading-progress').html("Loaded "+loadedCounter.toString()+" of "+imageItems.length.toString()+" images");
        }
    }
    
    // create item element for each image
    function getItemElement(data) {
        var elem = document.createElement('div');
        image_ext = "." + data.url.split('.').slice(-1)[0];
        elem.style.backgroundImage = "url('/static/"+data.url+"')";
        elem.className = 'image-item'
        elem.style.width = data.width.toString()+"px";
        elem.style.height = data.height.toString()+"px";
        elem.data = data;
        return elem;
    };
    
    // Delegate mouse click event to image items
    $('.image-item').on('click', function(e) {

        imageData = this.data;
        imageData.image_url = this.data.url.replace(/\.[^/.]+$/, ""); // remove extension
        imageData.image_id = imageData.image_url.split("/").slice(-1)[0]
        imageData.image_width = this.data.width;
        imageData.image_height = this.data.height;
        imageData.major_axis_length = this.data.major_axis_length;
        imageData.minor_axis_length = this.data.minor_axis_length;
        imageData.aspect_ratio = this.data.aspect_ratio;
        imageData.orientation = this.data.orientation;
        imageData.clipped_fraction = this.data.clipped_fraction;
        imageData.image_timestamp = this.data.timestring;
        imageData.pred = this.data.pred;
        imageData.prob_non_proro = this.data.prob_non_proro;
        imageData.prob_proro = this.data.prob_proro;

        // Otherwise show image detail
        showImageDetail(imageData);


    });

    // Delegate mouse enter event to image items
    $('.image-item').on('mouseenter', function(){

        var majLen = this.data.major_axis_length.toString()*res;
        var minLen = this.data.minor_axis_length.toString()*res;
        var text = this.data.timestring + ", Major Length: " + majLen.toPrecision(3) + " mm, Minor Length: " + minLen.toPrecision(3) + " mm";
        $('#info-text').html('Image Info: ');
        $('#status-text').html(text);

    });

    $('.image-item').on('mouseexit', function(){

        $('#status-text').html('');

    });
    
}

function updateMosaicImages(query) {
    
    $('#loading-progress').width("100%");
    $('#loading-progress').html('Querying Images...');
    $('#loading-progress').addClass('progress-bar-striped');
    $('#loading-progress').toggleClass('progress-bar-danger progress-bar-primary');
    
    imageItems = [];
    
    $('.progress').fadeIn(250,function () {
    
        if (typeof query['preset'] != 'undefined') {
            if (query['preset'] == 'reallybig') {
                imageItems = roistore({major_axis_length:{gt:90}}).order("height desc").get();
            }
            else if (query['preset'] == 'big') {
                imageItems = roistore({major_axis_length:{gt:45}}).order("height desc").get();
            }
            else if (query['preset'] == 'small') {
                imageItems = roistore({major_axis_length:{lt:45}}).order("height desc").get();
            }
            else if (query['preset'] == 'verysmall') {
                imageItems = roistore({major_axis_length:{lt:22}}).order("height desc").get();
            }
            else if (query['preset'] == 'long') {
                imageItems = roistore({aspect_ratio:{gt:0.0,lt:0.1}}).order("height desc").get();
            }
            else if (query['preset'] == 'round') {
                imageItems = roistore({aspect_ratio:{gt:0.8,lt:1.0}}).order("height desc").get();
            }
            $('#loading-progress').html('Building Mosaic...');
            $('#loading-progress').removeClass('progress-bar-striped');
            $('#loading-progress').toggleClass('progress-bar-danger progress-bar-primary');
            buildImageMosaic(imageItems);
        }
        else {
            $('#loading-progress').html('Query Error, Aborted.');
            $('#loading-progress').addClass('progress-bar-danger');
            $('.progress').fadeOut(4000);
        }
    });
    
}

$('#ImageDetail').on('hide.bs.modal', function (e) {
    imageDetailActive = false;
    /*$('#ShowBoundaryImage').unbind();*/
    $('#ShowBinaryImage').unbind();
    $('#ShowImage').unbind();
    $('#DownloadImage').unbind();
});


// hide status when done
$( document ).ready(function() {
    
  $('#tabs').removeClass('collapse');
  //$('.progress').addClass('collapse');
  updateMosaicImages({preset:'reallybig'});
});

var num_pred_0 = document.getElementById("doughnut-chart").getAttribute("data-pred-0");
var num_pred_1 = document.getElementById("doughnut-chart").getAttribute("data-pred-1");

if( !isNaN(num_pred_1)) {
    num_pred_1 = parseInt(num_pred_1, 10);
    num_pred_0 = parseInt(num_pred_0, 10);
new Chart(document.getElementById("doughnut-chart"), {
    type: 'doughnut',
    data: {
      labels: ["other", "Prorocentrum Michans"],
      datasets: [
        {
          label: "# of Predictions",
          backgroundColor: ["#3e95cd", "#8e5ea2"],
          data: [num_pred_0, num_pred_1]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Prediction Distribution'
      }
    }
});
}

// filter by class label
function createAnnotMosaic() {

    // create the Mosaic
    if(document.getElementById("class-drop").value == "Prorocentrum"){
        currClass = 1;
        populateMos(1);
    } else {
        currClass = 0;
        populateMos(0);
    }
}

// populate mosaic with images with class label
function populateMos(label) {

    // query for all images with pred = label
    imgItems = roistore({pred:{is:label}}).order("prob_non_proro desc").get();

    // update counters

    $("#num-incorrect").text("0/" + imgItems.length);
    $("#num-annot").text("0/" + imgItems.length);

    // display imgItems
    buildAnnotMosaic(imgItems);
}

function buildAnnotMosaic(imageItems) {
    
    loadedCounter = 0;
    $('#MosaicContainer-annot').empty();
    
    
    for ( var i = 0; i < imageItems.length; i++ ) {
        var elem = getItemElement(imageItems[i]);
        $('#MosaicContainer-annot').append(elem);
        loadedCounter++;
    }
    
    // create item element for each image
    function getItemElement(data) {
        var elem = document.createElement('div');
        image_ext = "." + data.url.split('.').slice(-1)[0];
        elem.style.backgroundImage = "url('/static/"+data.url+"')";
        elem.className = 'image-item'
        elem.style.width = data.width.toString()+"px";
        elem.style.height = data.height.toString()+"px";
        elem.data = data;
        return elem;
    };
    
    // Delegate mouse click event to image items
    $('.image-item').on('click', SuryasFunction)

    function SuryasFunction(event) {

        // add borders and update incorrect stats
        if ($(this).hasClass("red-border")) {
            $(this).removeClass("red-border");
            incorrectCount -= 1;
            index = incorrectArr.indexOf(this.data.image_url + ".jpeg")
            incorrectArr = incorrectArr.splice(index, 1);      
        }
        else {
            $(this).addClass("red-border");
            incorrectCount += 1;
            incorrectArr.push(this.data.image_url + ".jpeg");
        }
    }

    $('.image-item').on('mouseenter', function(e) {

        imageData = this.data;
        imageData.image_url = this.data.url.replace(/\.[^/.]+$/, ""); // remove extension
        imageData.image_id = imageData.image_url.split("/").slice(-1)[0];
        imageData.image_width = this.data.width;
        imageData.image_height = this.data.height;
        imageData.major_axis_length = this.data.major_axis_length;
        imageData.minor_axis_length = this.data.minor_axis_length;
        imageData.aspect_ratio = this.data.aspect_ratio;
        imageData.orientation = this.data.orientation;
        imageData.clipped_fraction = this.data.clipped_fraction;
        imageData.image_timestamp = this.data.timestring;
        imageData.gtruth = this.data.gtruth;
        imageData.pred = this.data.pred;
        imageData.prob_non_proro = this.data.prob_non_proro;
        imageData.prob_proro = this.data.prob_proro;

        // show image detail
        showImageDetailAnnot(imageData);

    });

    $('.image-item').on('mouseexit', function(){

        $('#status-text').html('');

    });
    
}

function updateDetailImageAnnot(data) {


    //var cameraIndex = camera.val();
    var siteURL = '';

    var base_url = siteURL+ "/static/" + data.image_url;
    var image_url = base_url + image_ext;
    $('#TargetImg-annot').attr("src",image_url);
    // Compute Image size from ImageDetail Container
    var aspectRatio = data.image_height/data.image_width;
    var heightScale = $('#ImageDetail-annot').height()/data.image_height;
    var widthScale = $('#ImageDetail-annot').width()/data.image_width;
  
    // Scale Image by width
    $('#TargetImg-annot').width(300);
    $('#TargetImg-annot').height(300);
    $('#ImageDetailTitle-annot').html(image_url);

    // Info
    var classes = {};
    classes[0] = "Other";
    classes[1] = "Prorocentrum";
    //console.log(data);
    $('#ImageName-annot').html("<span class='info-label'>Image ID</span>" + "<span>" + data.image_id + "</span>");
    $('#Timestamp-annot').html("<span class='info-label'>Collection Datetime</span>" + "<span>" + data.image_timestamp + "</span>");
    $('#gtruth-lbl-annot').html("<span class='info-label'>Gtruth </span>" + "<span>" + "None" + " </span>");
    $('#pred-lbl-annot').html("<span class='info-label'>Predicted Class </span>" + "<span>" + classes[data.pred] + " </span>");
    $('#PredictedProb-annot').html("<span class='info-label'>Predicted Probabilities </span>");
    $('#ProbOther-annot').html("<span class='info-label'>Other</span>" + "<span>" + (data.prob_non_proro).toPrecision(3) + "</span>");
    $('#ProbProro-annot').html("<span class='info-label'>Prorocentrum</span>" + "<hspan>" + (data.prob_proro).toPrecision(3) + "</hspan>");
};

function showImageDetailAnnot(data) {
    // Otherwise show image detail
    //var data = this.roi_data;
    siteURL = '';
    var base_url = siteURL + data.image_url;
    updateDetailImageAnnot(data);
    $(window).resize(debouncer (function() { return updateDetailImageAnnot(data);}));

};


// Update database, re-render interface, send post to server
function setGtruth() {

    // prompt for confirmation with class, and number of images
    let conf = confirm("you annotated " + incorrectArr.length + 
                          " images as " + classText);

    if (conf == false) {
        return;
    }
    for(let i = 0; i < incorrectArr.length; i++) {
        roistore({url: incorrectArr[i]}).update({gtruth: annotClass});
        roistore({url: incorrectArr[i]}).update({pred: currClass == 1 ? 0 : 1});
    }
    // rerender
    populateMos(currClass);

    data = JSON.stringify(roistore().get())

    // write to file
    $.post("save_gtruth", data, function() {
    });

    // reset incorrect array
    incorrectArr = [];
}

// set annotate class to selected class
function setAnnotClass() {
    annotClass = document.getElementById("class-annot").value;
    console.log(annotClass);
    classText = $("#annot-classes option")[annotClass].innerHTML;
    console.log(classText);
    // maybe display this separately in a different color
}

$("#annot-sub").on("click", setGtruth);