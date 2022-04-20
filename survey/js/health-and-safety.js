import HMWADataService from "./services/hmwa.js";

const form = document.querySelector("form");
const surveyee = JSON.parse(sessionStorage.getItem("surveyee"));
const btn_submit = document.querySelector(".button#submit");

// Eventlisteners
btn_submit.addEventListener("click", btn_submit_clicked);

// Functions
function assess_checkboxes(assessment) {
	const checkboxes = document.querySelectorAll(
		'.form-group input[type="checkbox"]:checked'
	);
	if (checkboxes && checkboxes.length) {
		checkboxes.forEach((item) => assessment.experiences.push(item.value));
		return;
	}
	assessment.experiences.push("None of the above");
}

function assess_radiobuttons(assessment) {
	const radiobutton_exposed = document.querySelector(
		'.form-group#exposed input[type="radio"]:checked'
	);
	const radiobutton_traveled = document.querySelector(
		'.form-group#traveled input[type="radio"]:checked'
	);

	switch (radiobutton_exposed.value) {
		case "exposed":
			assessment.is_exposed = true;
			break;

		default:
			assessment.is_exposed = false;
			break;
	}
	switch (radiobutton_traveled.value) {
		case "outside province":
			assessment.traveled.location = "outside province";
			assessment.traveled.has_traveled = true;
			break;
		case "outside philippines":
			assessment.traveled.location = "outside philippines";
			assessment.traveled.has_traveled = true;
			break;
		default:
			assessment.traveled.location = "";
			assessment.traveled.has_traveled = false;
			break;
	}
}

async function submit(assessment) {
	try {
		btn_submit.disabled = true;
		if (surveyee.email) {
			await HMWADataService.put_surveyee_information(surveyee);
			await HMWADataService.put_surveyee_assessment(surveyee.email, assessment);
			swal({
				icon: "success",
				title: "Success",
				text: "Thank you for your participation",
				timer: 2000,
				buttons: false,
			}).then(() => {
				window.location.href = "/surveyee.html";
			});
		} else {
			throw new Error("Invalid Surveyee");
		}
	} catch (error) {
		swal({
			icon: "error",
			title: "Error",
			text: error.message,
			timer: 2000,
			buttons: false,
		});
	}
}

async function btn_submit_clicked(e) {
	e.preventDefault();
	const is_confirm = form.reportValidity();
	if (is_confirm) {
		const today = new Date();
		const assessment = {
			experiences: [],
			is_exposed: false,
			traveled: { location: "", has_traveled: false },
			date: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
		};

		assess_checkboxes(assessment);
		assess_radiobuttons(assessment);

		await submit(assessment);
	}
}
