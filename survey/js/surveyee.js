import HMWADataService from "./services/hmwa.js";

const courses = {
	"College of Allied Medical Professions": [
		"Bachelor of Science in Clinical Pharmacy",
		"Bachelor of Science in Medical Technology",
		"Bachelor of Science in Occupational Therapy",
		"Bachelor of Science in Pharmacy",
		"Bachelor of Science in Physical Therapy",
		"Bachelor of Science in Radiologic Technology",
	],
	"College of Arts and Sciences": [
		"Bachelor of Arts in Communication",
		"Bachelor of Arts in Psychology",
		"Bachelor of Arts in Psychology - Master of Arts in Psychology",
		"Bachelor of Science in Biology",
		"Bachelor of Science in Psychology",
	],
	"College of Business and Accountancy": [
		"Bachelor of Science in Accountancy",
		"Bachelor of Science in Business Administration",
		"Bachelor of Science in Hospitality Management",
		"Bachelor of Science in Hotel and Restaurant Management",
		"Bachelor of Science in Management Accounting",
		"Bachelor of Science in Tourism Management",
	],
	"College of Computer Studies": [
		"Bachelor of Multimedia Arts",
		"Bachelor of Science in Computer Science",
		"Bachelor of Science in Information Technology",
	],
	"College of Criminal Justice Education": [
		"Bachelor of Science in Criminology",
	],
	"College of Engineering and Architecture": [
		"Bachelor of Science in Architecture",
		"Bachelor of Science in Civil Engineering",
		"Bachelor of Science in Computer Engineering",
		"Bachelor of Science in Electronics Engineering",
	],
	"College of Education": [
		"Bachelor of Elementary Education",
		"Bachelor of Secondary Education",
		"Bachelor of Special Needs Education",
	],
	"College of Nursing": ["Bachelor of Science in Nursing"],
	"School of Law": ["Juris Doctor"],
	"School of Medicine": ["Doctor of Medicine"],
	"Graduate School": [
		"Doctor in Business Administration (Professional Track)",
		"Doctor of Information Technology",
		"Doctor of Philosophy in Curriculum and Instruction",
		"Doctor of Philosophy in Education",
		"Doctor of Public Health in Health Promotion and Education",
		"Doctor of Public Health in Health Promotion and Education (Professional Track)",
		"Master in Business Administration",
		"Master in Information Technology",
		"Master in Nursing",
		"Master in Public Health",
		"Master of Arts in Education",
		"Master of Arts in Nursing",
		"Master of Arts in Psychology",
		"Master of Medical Laboratory Science",
		"Master of Science in Criminal Justice with Specialization in Criminology",
		"Master of Science in Medical Laboratory Science",
		"Master of Science in Physical Therapy",
		"Master of Science in Public Health",
	],
	"Integrated School": [],
	"Non-teaching Personnel": [],
};

const dropdowns = document.querySelectorAll(".dropdown-input");
const email = document.querySelector(".text-input#email");
const lastname = document.querySelector(".text-input#lastname");
const firstname = document.querySelector(".text-input#firstname");
const middlename = document.querySelector(".text-input#middlename");
const sex = document.querySelector(".dropdown-input#sex");
const age = document.querySelector(".text-input#age");
const contact_number = document.querySelector(".text-input#tel");
const textarea = document.querySelector(".textarea-input#address");
const college = document.querySelector(".dropdown-input#college");
const course = document.querySelector(".dropdown-input#course");
const position = document.querySelector(".dropdown-input#position");

const btn_next = document.querySelector(".button#next");

// Eventlisteners
textarea.addEventListener("input", textarea_onchange);
btn_next.addEventListener("click", btn_next_clicked);
dropdowns.forEach((dropdown) =>
	dropdown.addEventListener("change", dropdown_changed)
);

// Functions
function dropdown_changed(e) {
	e.target.classList.remove("unselected");
	if (e.target.id === "college") {
		let target_college = e.target.value;
		if (courses[target_college].length) {
			course.parentNode.classList.remove("disabled");
			course.disabled = false;
			course.classList.add("unselected");
			let html =
				"<option disabled selected value hidden>-- Select program --</option>";
			for (const course of courses[target_college]) {
				html += `<option value='${course}'>${course}</option>`;
			}
			course.innerHTML = html;
		}
	}
}
function textarea_onchange(e) {
	e.target.style.height = "auto";
	e.target.style.height = `${e.target.scrollHeight}px`;
}

function btn_next_clicked(e) {
	let surveyee = {
		lastname: lastname.value,
		middlename: middlename.value,
		firstname: firstname.value,
		sex: sex.value,
		age: age.value,
		contact_number: contact_number.value,
		email: email.value,
		address: address.value,
		college: college.value,
		course: course.value,
		position: position.value,
	};
	surveyee = JSON.stringify(surveyee);
	sessionStorage.setItem("surveyee", surveyee);
}

(async function () {
	const params = new Proxy(new URLSearchParams(window.location.search), {
		get: (searchParams, prop) => searchParams.get(prop),
	});
	try {
		let user = JSON.parse(decodeURIComponent(window.atob(params.user)));
		lastname.value = user.lastname;
		firstname.value = user.firstname;
		email.value = user.email;
		let surveyee = await HMWADataService.get_surveyee_information(user.email);
		surveyee = surveyee.data;
		if (surveyee) {
			middlename.value = surveyee.middlename;
			sex.value = surveyee.sex;
			age.value = surveyee.age;
			contact_number.value = surveyee.contact_number;
			address.value = surveyee.address;
			college.value = surveyee.college;
			position.value = surveyee.position;

			dropdowns.forEach((dropdown) => dropdown.classList.remove("unselected"));
			if (
				surveyee.college !== "Integrated School" &&
				surveyee.college !== "Non-teaching Personnel"
			) {
				course.parentNode.classList.remove("disabled");
				course.disabled = false;
				course.classList.remove("unselected");
				let html =
					"<option disabled selected value hidden>-- Select program --</option>";
				for (const course of courses[surveyee.college]) {
					html += `<option value='${course}'>${course}</option>`;
				}
				course.innerHTML = html;
				course.value = surveyee.course;
			} else {
				course.parentNode.classList.add("disabled");
				course.disabled = true;
				course.classList.add("unselected");
				let html =
					"<option disabled selected value hidden>-- Select program --</option>";
				course.innerHTML = html;
			}
		}
	} catch (e) {
		const surveyee = JSON.parse(sessionStorage.getItem("surveyee"));
		if (surveyee) {
			lastname.value = surveyee.lastname;
			firstname.value = surveyee.firstname;
			email.value = surveyee.email;
			middlename.value = surveyee.middlename;
			sex.value = surveyee.sex;
			age.value = surveyee.age;
			contact_number.value = surveyee.contact_number;
			address.value = surveyee.address;
			college.value = surveyee.college;
			position.value = surveyee.position;

			dropdowns.forEach((dropdown) => dropdown.classList.remove("unselected"));
			if (
				surveyee.college !== "Integrated School" &&
				surveyee.college !== "Non-teaching Personnel"
			) {
				course.parentNode.classList.remove("disabled");
				course.disabled = false;
				course.classList.remove("unselected");
				let html =
					"<option disabled selected value hidden>-- Select program --</option>";
				for (const course of courses[surveyee.college]) {
					html += `<option value='${course}'>${course}</option>`;
				}
				course.innerHTML = html;
				course.value = surveyee.course;
			}
		} else {
			btn_next.remove();
			swal({
				icon: "error",
				title: "Error",
				text: "Surveyee Unauthorized",
				buttons: false,
			}).then(() => {
				window.location.href = "http://localhost:5000/api/v1/hmwa/auth/google";
			});
		}
	}
})();
