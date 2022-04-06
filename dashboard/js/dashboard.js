import HMWADataService from "./services/hmwa.js";

const user_email = sessionStorage.getItem("username");
let edit_target = "";
let reports = {};
let users = {};
let population = {};
let today = new Date();
today = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
let departments = [];
const month = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

let selected_weeks = {};
let sick_surveee_chart = {};
let overtime_chart = {};
let sick_department_chart = {};
let exposed_chart = {};
let outside_province_chart = {};
let outside_philippines_chart = {};

let healthy_surveyees_tooltip = {};
let sick_surveyees_tooltip = {};

const close = document.querySelector(".fa-xmark");
const months = document.querySelector(".months");
const months_contents = document.querySelectorAll(".months-contents span");
const weeks = document.querySelector(".weeks");
const menu_icon = document.querySelector(".fa-square-pen");
const menu_content = document.querySelector(".menu-content");
const user_form = document.getElementById("user-form");
const update_total = document.getElementById("update-total");
const change_password = document.getElementById("change-password");
const search = document.getElementById("search");
const overlay = document.querySelector(".overlay");
const overlay_loading = document.querySelector(".overlay-loading");
const user_content = document.querySelector(".user-content");
const create_edit = document.getElementById("create-edit");
const create_edit_form = document.querySelector(".create-edit-form");
const change_password_form = document.querySelector(".change-password-form");
const update_total_form = document.querySelector(".update-total-form");
const total_inputs = update_total_form.querySelectorAll("input[type='number']");
const submit = document.getElementById("create-update");
const cancel = document.querySelector(
	".create-edit-form button[type='button']"
);
const update_admin = document.getElementById("update");
const update_college = document.getElementById("update-college");
const username = document.getElementById("username");
const password = document.getElementById("password");
const repeat_password = document.getElementById("repeat-password");
const admin_old_password = document.getElementById("admin-old-password");
const admin_password = document.getElementById("admin-password");
const admin_repeat_password = document.getElementById("admin-repeat-password");
const btn_users = document.getElementById("users");
const btn_sign_out = document.getElementById("sign_out");
const loading = document.querySelector(".main-loading");
const dashboard = document.querySelector(".dashboard");
const surveyees = document.querySelector(".surveyees");
const download = document.querySelector(".download");
const eyes = document.querySelectorAll(".eye");

close.addEventListener("click", close_clicked);
months.addEventListener("click", months_clicked);
months_contents.forEach((month_content) => {
	month_content.addEventListener("click", months_contents_clicked);
});
weeks.addEventListener("click", weeks_clicked);
menu_icon.addEventListener("click", menu_icon_clicked);
overlay.addEventListener("mousedown", overlay_clicked);
submit.addEventListener("click", submit_clicked);
update_admin.addEventListener("click", update_admin_clicked);
update_college.addEventListener("click", update_college_clicked);
eyes.forEach((eye) => eye.addEventListener("click", eye_clicked));
download.addEventListener("click", download_data);
window.addEventListener("click", window_clicked);
btn_sign_out.addEventListener("click", sign_out_clicked);
btn_users.addEventListener("click", users_clicked);
cancel.addEventListener("click", cancel_clicked);
search.addEventListener("keyup", search_keyup);
user_form.addEventListener("click", user_form_clicked);
update_total.addEventListener("click", update_total_clicked);
change_password.addEventListener("click", change_password_clicked);

function close_clicked(e) {
	overlay.classList.add("hidden");
	document.body.style.overflow = "hidden auto";
}

function months_clicked(e) {
	months.querySelector(".months-text").classList.toggle("active");
	months.querySelector(".months-contents").classList.toggle("hidden");
}

function months_contents_clicked(e) {
	const target_month = e.target.innerText;
	if (months.querySelector(".months-text").innerText === target_month) {
		return;
	}
	const month_index = month.indexOf(target_month);
	const current_month = month[month_index];
	const current_year = new Date().getFullYear();
	months.querySelector(".months-text span").innerText = current_month;
	const month_weeks = get_weeks_start_and_end_in_month(
		month_index,
		current_year
	);
	const weeks_content = weeks.querySelector(".weeks-contents");
	let week_html = "";
	if (new Date().getMonth() == month.indexOf(target_month)) {
		week_html += "<span>Today</span>";
	}
	Object.keys(month_weeks).forEach((index) => {
		index = parseInt(index);
		index++;
		let placeholder = "";
		switch (index) {
			case 1:
				placeholder = "1st Week";
				break;
			case 2:
				placeholder = "2nd Week";
				break;
			case 3:
				placeholder = "3rd Week";
				break;
			default:
				placeholder = `${index}th Week`;
		}
		const start = month_weeks[index - 1].start;
		const end = month_weeks[index - 1].end;
		week_html += `<span start="${start}" end="${end}"><span>${placeholder}</span><span>(${start}-${end})</span></span>`;
	});
	week_html += "<span>Whole Month</span>";
	weeks_content.innerHTML = week_html;

	const weeks_contents = document.querySelectorAll(".weeks-contents > span");
	weeks_contents.forEach((week_content) => {
		week_content.addEventListener("click", weeks_contents_clicked);
	});
	selected_weeks = weeks_contents[weeks_contents.length - 1];

	const week_text_spans = weeks.querySelectorAll(".weeks-text span");
	week_text_spans[0].innerText = "Whole Month";
	week_text_spans[1].innerText = "";

	monthly_sick_count_surveyees(month_index + 1);
	monthly_sick_surveyees(month_index + 1);
	monthly_sick_department(month_index + 1);
	monthly_exposed(month_index + 1);
	monthly_traveled(month_index + 1);
	set_sickness_overtime(target_month, "Whole Month", 0, 0);
}

function weeks_clicked(e) {
	weeks.querySelector(".weeks-text").classList.toggle("active");
	weeks.querySelector(".weeks-contents").classList.toggle("hidden");
}

function weekly_sick_count_surveyees(current_month, start, end) {
	const healthy_surveyees = document.getElementById("safe-count");
	const sick_surveyees = document.getElementById("sick-count");

	let healthy = 0;
	let sick = 0;

	for (const department of departments) {
		for (const surveyee of Object.keys(reports[department])) {
			let healthy_checker = 0;
			let sick_checker = 0;
			let healthy_counter = 0;
			let sick_counter = 0;
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const { month, day } = {
					month: parseInt(date[1]),
					day: parseInt(date[2]),
				};

				if (month === current_month && day >= start && day <= end) {
					if (assessment.experiences.includes("None of the above")) {
						if (!healthy_checker) {
							healthy_checker++;
							healthy_counter = day;
						}
					} else {
						if (!sick_checker) {
							sick_checker++;
							sick_counter = day;
						}
					}
					if (healthy_checker && sick_checker) {
						break;
					}
				}
			}
			if (healthy_counter === 0 && sick_counter === 0) {
				continue;
			}
			if (healthy_counter > sick_counter) {
				healthy++;
			} else {
				sick++;
			}
		}
	}
	healthy_surveyees.innerText = healthy;
	sick_surveyees.innerText = sick;
}

function weekly_sick_surveyees(current_month, start, end) {
	if (sick_surveee_chart instanceof Chart) {
		sick_surveee_chart.destroy();
	}
	let sickness = document.getElementById("sickness").getContext("2d");
	let temp_sicknesses = sicknesses.slice(0, sicknesses.length - 1);
	let values = {};
	for (const department of departments) {
		for (const surveyee of Object.keys(reports[department])) {
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const { month, day } = {
					month: parseInt(date[1]),
					day: parseInt(date[2]),
				};
				let is_sick = false;
				if (month === current_month && day >= start && day <= end) {
					if (assessment.experiences.includes("None of the above")) {
						break;
					}
					for (const sickness of temp_sicknesses) {
						if (!values[sickness] || values[sickness] == undefined) {
							values[sickness] = 0;
						}
						if (assessment.experiences.includes(sickness)) {
							values[sickness]++;
							is_sick = true;
						}
					}
					if (is_sick) {
						break;
					}
				}
			}
		}
	}

	if (!Object.keys(values).length) {
		document.getElementById("sickness").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("sickness").parentNode.parentNode.style.display =
			"block";
	}

	Object.keys(values).forEach((value, index) => {
		if (!values[value]) {
			delete values[value];
		} else {
			values[value]++;
		}
	});

	const config = set_pie(
		Object.keys(values),
		Object.values(values),
		[
			"#eafff6",
			"#bfffe3",
			"#95ffd1",
			"#6affbf",
			"#40ffac",
			"#15ff9a",
			"#00ea85",
			"#00bf6c",
			"#009554",
			"#006a3c",
			"#004024",
		],
		[
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
		]
	);

	sick_surveee_chart = new Chart(sickness, config);
}

function weekly_sick_department(current_month, start, end) {
	if (sick_department_chart instanceof Chart) {
		sick_department_chart.destroy();
	}
	let sick_count_department = document
		.getElementById("sickness-department")
		.getContext("2d");

	let values = {};

	let index = 0;
	for (const department of departments) {
		values[departments_abbreviations[index]] = 0;
		for (const surveyee of Object.keys(reports[department])) {
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const { month, day } = {
					month: parseInt(date[1]),
					day: parseInt(date[2]),
				};
				if (month === current_month && day >= start && day <= end) {
					if (!assessment.experiences.includes("None of the above")) {
						values[departments_abbreviations[index]]++;
						break;
					} else {
						break;
					}
				}
			}
		}
		index++;
	}

	let checker = Object.values(values).reduce(
		(prev_value, current_value) => prev_value + current_value
	);

	if (!checker) {
		document.getElementById(
			"sickness-department"
		).parentNode.parentNode.style.display = "none";
		return;
	} else {
		document.getElementById(
			"sickness-department"
		).parentNode.parentNode.style.display = "block";
	}

	const temp_np = values["NP"];
	delete values["NP"];
	values["NTP"] = temp_np;

	const tooltip_labels = {};
	Object.keys(values).forEach((value) => {
		if (!values[value]) {
			delete values[value];
		} else {
			tooltip_labels[value] = values[value];
			if (population[value.toLowerCase()]) {
				values[value] = (
					(values[value] / population[value.toLowerCase()]) *
					100
				).toFixed(2);
			} else {
				values[value] = (
					(values[value] /
						Object.keys(reports["Non-teaching Personnel"]).length) *
					100
				).toFixed(2);
			}
		}
	});

	let not_mobile = true;
	if (window.innerWidth <= 800 && window.innerHeight <= 900) {
		not_mobile = false;
	}

	if (Object.keys(values).length <= 1) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "80px");
	} else if (Object.keys(values).length <= 2) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "120px");
	} else if (Object.keys(values).length <= 3) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "180px");
	} else if (Object.keys(values).length <= 4) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "250px");
	} else {
		if (not_mobile) {
			document
				.getElementById("sickness-department")
				.setAttribute("height", "400px");
		} else {
			document
				.getElementById("sickness-department")
				.setAttribute("height", "700px");
		}
	}

	const config = set_bar(
		Object.keys(values),
		Object.values(values),
		[
			"#fdedf0",
			"#f9cad1",
			"#f6a6b2",
			"#f28394",
			"#ee5f75",
			"#eb3b56",
			"#e71838",
			"#c4142f",
			"#a01127",
			"#7c0d1e",
			"#590915",
			"#35060d",
			"#120204",
		],
		[
			"black",
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
		],
		tooltip_labels
	);

	sick_department_chart = new Chart(sick_count_department, config);
}

function weekly_exposed(current_month, start, end) {
	if (exposed_chart instanceof Chart) {
		exposed_chart.destroy();
	}
	let exposed = document.getElementById("exposed").getContext("2d");
	let is_exposed = {};
	let is_not_exposed = 0;
	let sum = 0;

	let index = 0;
	for (const department of departments) {
		is_exposed[departments_abbreviations[index]] = 0;
		for (const surveyee of Object.keys(reports[department])) {
			let not_exposed_counter = 0;
			let not_exposed_checker = 0;
			let exposed_counter = 0;
			let exposed_checker = 0;
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const { month, day } = {
					month: parseInt(date[1]),
					day: parseInt(date[2]),
				};
				if (month === current_month && day >= start && day <= end) {
					if (assessment.is_exposed) {
						if (!exposed_checker) {
							exposed_counter = day;
							exposed_checker++;
						}
					} else {
						if (!not_exposed_checker) {
							not_exposed_counter = day;
							not_exposed_checker++;
						}
					}
					if (exposed_checker && not_exposed_checker) {
						break;
					}
				}
			}
			if (not_exposed_counter == 0 && exposed_counter == 0) {
				continue;
			}
			if (not_exposed_counter > exposed_counter) {
				is_not_exposed++;
			} else {
				is_exposed[departments_abbreviations[index]]++;
				sum++;
			}
		}
		index++;
	}

	document.getElementById("not-exposed-count").innerText = is_not_exposed;
	document.getElementById("exposed-count").innerText = sum || 0;

	let checker = Object.values(is_exposed).reduce(
		(prev_value, current_value) => prev_value + current_value
	);

	if (!checker) {
		document.getElementById("exposed").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("exposed").parentNode.parentNode.style.display =
			"block";
	}
	const temp_np = is_exposed["NP"];
	delete is_exposed["NP"];
	is_exposed["NTP"] = temp_np;

	Object.keys(is_exposed).forEach((value) => {
		if (!is_exposed[value]) {
			delete is_exposed[value];
		} else {
			is_exposed[value]++;
		}
	});

	const config = set_pie(
		Object.keys(is_exposed),
		Object.values(is_exposed),
		[
			"#fdfeed",
			"#fafbc8",
			"#f7f9a3",
			"#f4f67f",
			"#f1f35a",
			"#edf135",
			"#eaee11",
			"#c6ca0e",
			"#a2a50c",
			"#7e8009",
			"#5a5c06",
			"#5a5c06",
			"#363704",
		],
		[
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
		]
	);

	exposed_chart = new Chart(exposed, config);
}

function weekly_traveled(current_month, start, end) {
	if (outside_province_chart instanceof Chart) {
		outside_province_chart.destroy();
	}

	if (outside_philippines_chart instanceof Chart) {
		outside_philippines_chart.destroy();
	}

	const province = document.getElementById("province").getContext("2d");
	const philippines = document.getElementById("philippines").getContext("2d");
	let has_traveled = 0;
	let has_not_traveled = 0;
	const outside_province = {};
	const outside_philippines = {};

	let index = 0;
	for (const department of departments) {
		outside_province[departments_abbreviations[index]] = 0;
		outside_philippines[departments_abbreviations[index]] = 0;
		for (const surveyee of Object.keys(reports[department])) {
			let has_traveled_checker = false;
			let within_range = false;
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const { month, day } = {
					month: parseInt(date[1]),
					day: parseInt(date[2]),
				};
				if (month === current_month && day >= start && day <= end) {
					within_range = true;
					if (assessment.traveled.has_traveled) {
						has_traveled_checker = true;
						has_traveled++;
						if (assessment.traveled.location === "outside province") {
							outside_province[departments_abbreviations[index]]++;
						} else {
							outside_philippines[departments_abbreviations[index]]++;
						}
						break;
					}
				} else {
					within_range = false;
				}
			}
			if (within_range && !has_traveled_checker) {
				has_not_traveled++;
			}
		}
		index++;
	}

	document.getElementById("sheltered-count").innerText = has_not_traveled;
	document.getElementById("traveled-count").innerText = has_traveled;

	if (!has_traveled) {
		document.getElementById("province").parentNode.parentNode.style.display =
			"none";
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("province").parentNode.parentNode.style.display =
			"block";
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"block";
	}

	let temp_np = outside_province["NP"];
	delete outside_province["NP"];
	outside_province["NTP"] = temp_np;

	temp_np = outside_philippines["NP"];
	delete outside_philippines["NP"];
	outside_philippines["NTP"] = temp_np;

	Object.keys(outside_province).forEach((key) => {
		if (!outside_province[key]) {
			delete outside_province[key];
		} else {
			outside_province[key]++;
		}
	});
	Object.keys(outside_philippines).forEach((key) => {
		if (!outside_philippines[key]) {
			delete outside_philippines[key];
		} else {
			outside_philippines[key]++;
		}
	});

	let checker = 0;

	if (Object.keys(outside_province).length) {
		checker = Object.values(outside_province).reduce(
			(prev_value, current_value) => prev_value + current_value
		);
	}

	if (!checker) {
		document.getElementById("province").parentNode.parentNode.style.display =
			"none";
	} else {
		document.getElementById("province").parentNode.parentNode.style.display =
			"block";
		const province_config = set_pie(
			Object.keys(outside_province),
			Object.values(outside_province),
			[
				"#fbedfd",
				"#f2c9fa",
				"#e9a5f7",
				"#e081f4",
				"#d75cf1",
				"#ce38ee",
				"#c514eb",
				"#a611c7",
				"#880ea3",
				"#6a0b7e",
				"#4c085a",
				"#2d0536",
				"#0f0212",
			],
			[
				"black",
				"black",
				"black",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
			]
		);
		outside_province_chart = new Chart(province, province_config);
	}
	checker = 0;

	if (Object.keys(outside_philippines).length) {
		checker = Object.values(outside_philippines).reduce(
			(prev_value, current_value) => prev_value + current_value
		);
	}

	if (!checker) {
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"none";
	} else {
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"block";
		const philippines_config = set_pie(
			Object.keys(outside_philippines),
			Object.values(outside_philippines),
			[
				"#fdf4ed",
				"#fadfc9",
				"#f7caa5",
				"#f4b580",
				"#f19f5c",
				"#ee8a38",
				"#eb7514",
				"#c76311",
				"#a3510e",
				"#7e3f0b",
				"#5a2d08",
				"#361b05",
				"#120902",
			],
			[
				"black",
				"black",
				"black",
				"black",
				"black",
				"black",
				"black",
				"white",
				"white",
				"white",
				"white",
			]
		);

		outside_philippines_chart = new Chart(philippines, philippines_config);
	}
}

function monthly_sick_count_surveyees(current_month) {
	const healthy_surveyees = document.getElementById("safe-count");
	const sick_surveyees = document.getElementById("sick-count");

	let healthy = 0;
	let sick = 0;

	for (const department of departments) {
		for (const surveyee of Object.keys(reports[department])) {
			let healthy_checker = 0;
			let sick_checker = 0;
			let healthy_counter = 0;
			let sick_counter = 0;
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const { month, day } = {
					month: parseInt(date[1]),
					day: parseInt(date[2]),
				};

				if (month === current_month) {
					if (assessment.experiences.includes("None of the above")) {
						if (!healthy_checker) {
							healthy_checker++;
							healthy_counter = day;
						}
					} else {
						if (!sick_checker) {
							sick_checker++;
							sick_counter = day;
						}
					}
					if (healthy_checker && sick_checker) {
						break;
					}
				}
			}
			if (healthy_counter === 0 && sick_counter === 0) {
				continue;
			}
			if (healthy_counter > sick_counter) {
				healthy++;
			} else {
				sick++;
			}
		}
	}
	healthy_surveyees.innerText = healthy;
	sick_surveyees.innerText = sick;
}

function monthly_sick_surveyees(current_month) {
	if (sick_surveee_chart instanceof Chart) {
		sick_surveee_chart.destroy();
	}
	let sickness = document.getElementById("sickness").getContext("2d");
	let temp_sicknesses = sicknesses.slice(0, sicknesses.length - 1);
	let values = {};
	for (const department of departments) {
		for (const surveyee of Object.keys(reports[department])) {
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const month = parseInt(date[1]);
				let is_sick = false;
				if (month === current_month) {
					if (assessment.experiences.includes("None of the above")) {
						break;
					}
					for (const sickness of temp_sicknesses) {
						if (!values[sickness] || values[sickness] == undefined) {
							values[sickness] = 0;
						}
						if (assessment.experiences.includes(sickness)) {
							values[sickness]++;
							is_sick = true;
						}
					}
					if (is_sick) {
						break;
					}
				}
			}
		}
	}

	if (!Object.keys(values).length) {
		document.getElementById("sickness").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("sickness").parentNode.parentNode.style.display =
			"block";
	}

	Object.keys(values).forEach((value, index) => {
		if (!values[value]) {
			delete values[value];
		} else {
			values[value]++;
		}
	});

	const config = set_pie(
		Object.keys(values),
		Object.values(values),
		[
			"#eafff6",
			"#bfffe3",
			"#95ffd1",
			"#6affbf",
			"#40ffac",
			"#15ff9a",
			"#00ea85",
			"#00bf6c",
			"#009554",
			"#006a3c",
			"#004024",
		],
		[
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
		]
	);

	sick_surveee_chart = new Chart(sickness, config);
}

function monthly_sick_department(current_month) {
	if (sick_department_chart instanceof Chart) {
		sick_department_chart.destroy();
	}
	let sick_count_department = document
		.getElementById("sickness-department")
		.getContext("2d");

	let values = {};

	let index = 0;
	for (const department of departments) {
		values[departments_abbreviations[index]] = 0;
		for (const surveyee of Object.keys(reports[department])) {
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const month = parseInt(date[1]);
				if (month === current_month) {
					if (!assessment.experiences.includes("None of the above")) {
						values[departments_abbreviations[index]]++;
						break;
					} else {
						break;
					}
				}
			}
		}
		index++;
	}

	let checker = Object.values(values).reduce(
		(prev_value, current_value) => prev_value + current_value
	);

	if (!checker) {
		document.getElementById(
			"sickness-department"
		).parentNode.parentNode.style.display = "none";
		return;
	} else {
		document.getElementById(
			"sickness-department"
		).parentNode.parentNode.style.display = "block";
	}

	const temp_np = values["NP"];
	delete values["NP"];
	values["NTP"] = temp_np;

	const tooltip_labels = {};
	Object.keys(values).forEach((value) => {
		if (!values[value]) {
			delete values[value];
		} else {
			tooltip_labels[value] = values[value];
			if (population[value.toLowerCase()]) {
				values[value] = (
					(values[value] / population[value.toLowerCase()]) *
					100
				).toFixed(2);
			} else {
				values[value] = (
					(values[value] /
						Object.keys(reports["Non-teaching Personnel"]).length) *
					100
				).toFixed(2);
			}
		}
	});

	let not_mobile = true;
	if (window.innerWidth <= 800 && window.innerHeight <= 900) {
		not_mobile = false;
	}

	if (Object.keys(values).length <= 1) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "80px");
	} else if (Object.keys(values).length <= 2) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "120px");
	} else if (Object.keys(values).length <= 3) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "180px");
	} else if (Object.keys(values).length <= 4) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "250px");
	} else {
		if (not_mobile) {
			document
				.getElementById("sickness-department")
				.setAttribute("height", "400px");
		} else {
			document
				.getElementById("sickness-department")
				.setAttribute("height", "700px");
		}
	}

	const config = set_bar(
		Object.keys(values),
		Object.values(values),
		[
			"#fdedf0",
			"#f9cad1",
			"#f6a6b2",
			"#f28394",
			"#ee5f75",
			"#eb3b56",
			"#e71838",
			"#c4142f",
			"#a01127",
			"#7c0d1e",
			"#590915",
			"#35060d",
			"#120204",
		],
		[
			"black",
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
		],
		tooltip_labels
	);

	sick_department_chart = new Chart(sick_count_department, config);
}

function monthly_exposed(current_month) {
	if (exposed_chart instanceof Chart) {
		exposed_chart.destroy();
	}
	let exposed = document.getElementById("exposed").getContext("2d");
	let is_exposed = {};
	let is_not_exposed = 0;
	let sum = 0;

	let index = 0;
	for (const department of departments) {
		is_exposed[departments_abbreviations[index]] = 0;
		for (const surveyee of Object.keys(reports[department])) {
			let not_exposed_counter = 0;
			let not_exposed_checker = 0;
			let exposed_counter = 0;
			let exposed_checker = 0;
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const { month, day } = {
					month: parseInt(date[1]),
					day: parseInt(date[2]),
				};
				if (month === current_month) {
					if (assessment.is_exposed) {
						if (!exposed_checker) {
							exposed_counter = day;
							exposed_checker++;
						}
					} else {
						if (!not_exposed_checker) {
							not_exposed_counter = day;
							not_exposed_checker++;
						}
					}
					if (exposed_checker && not_exposed_checker) {
						break;
					}
				}
			}
			if (not_exposed_counter == 0 && exposed_counter == 0) {
				continue;
			}
			if (not_exposed_counter > exposed_counter) {
				is_not_exposed++;
			} else {
				is_exposed[departments_abbreviations[index]]++;
				sum++;
			}
		}
		index++;
	}

	document.getElementById("not-exposed-count").innerText = is_not_exposed;
	document.getElementById("exposed-count").innerText = sum || 0;

	let checker = Object.values(is_exposed).reduce(
		(prev_value, current_value) => prev_value + current_value
	);

	if (!checker) {
		document.getElementById("exposed").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("exposed").parentNode.parentNode.style.display =
			"block";
	}

	const temp_np = is_exposed["NP"];
	delete is_exposed["NP"];
	is_exposed["NTP"] = temp_np;

	Object.keys(is_exposed).forEach((value) => {
		if (!is_exposed[value]) {
			delete is_exposed[value];
		} else {
			is_exposed[value]++;
		}
	});

	const config = set_pie(
		Object.keys(is_exposed),
		Object.values(is_exposed),
		[
			"#fdfeed",
			"#fafbc8",
			"#f7f9a3",
			"#f4f67f",
			"#f1f35a",
			"#edf135",
			"#eaee11",
			"#c6ca0e",
			"#a2a50c",
			"#7e8009",
			"#5a5c06",
			"#5a5c06",
			"#363704",
		],
		[
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
		]
	);

	exposed_chart = new Chart(exposed, config);
}

function monthly_traveled(current_month) {
	if (outside_province_chart instanceof Chart) {
		outside_province_chart.destroy();
	}

	if (outside_philippines_chart instanceof Chart) {
		outside_philippines_chart.destroy();
	}
	const province = document.getElementById("province").getContext("2d");
	const philippines = document.getElementById("philippines").getContext("2d");
	let has_traveled = 0;
	let has_not_traveled = 0;
	const outside_province = {};
	const outside_philippines = {};

	let index = 0;
	for (const department of departments) {
		outside_province[departments_abbreviations[index]] = 0;
		outside_philippines[departments_abbreviations[index]] = 0;
		for (const surveyee of Object.keys(reports[department])) {
			let has_traveled_checker = false;
			for (const assessment of reports[department][surveyee].assessments) {
				const date = assessment.date.split("-");
				const month = parseInt(date[1]);
				if (month === current_month) {
					if (assessment.traveled.has_traveled) {
						has_traveled_checker = true;
						has_traveled++;
						if (assessment.traveled.location === "outside province") {
							outside_province[departments_abbreviations[index]]++;
						} else {
							outside_philippines[departments_abbreviations[index]]++;
						}
						break;
					}
				}
			}
			if (!has_traveled_checker) {
				has_not_traveled++;
			}
		}
		index++;
	}

	document.getElementById("sheltered-count").innerText = has_not_traveled;
	document.getElementById("traveled-count").innerText = has_traveled;

	if (!has_traveled) {
		document.getElementById("province").parentNode.parentNode.style.display =
			"none";
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("province").parentNode.parentNode.style.display =
			"block";
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"block";
	}

	let temp_np = outside_province["NP"];
	delete outside_province["NP"];
	outside_province["NTP"] = temp_np;

	temp_np = outside_philippines["NP"];
	delete outside_philippines["NP"];
	outside_philippines["NTP"] = temp_np;

	Object.keys(outside_province).forEach((key) => {
		if (!outside_province[key]) {
			delete outside_province[key];
		} else {
			outside_province[key]++;
		}
	});
	Object.keys(outside_philippines).forEach((key) => {
		if (!outside_philippines[key]) {
			delete outside_philippines[key];
		} else {
			outside_philippines[key]++;
		}
	});

	let checker = 0;

	if (Object.keys(outside_province).length) {
		checker = Object.values(outside_province).reduce(
			(prev_value, current_value) => prev_value + current_value
		);
	}

	if (!checker) {
		document.getElementById("province").parentNode.parentNode.style.display =
			"none";
	} else {
		document.getElementById("province").parentNode.parentNode.style.display =
			"block";
		const province_config = set_pie(
			Object.keys(outside_province),
			Object.values(outside_province),
			[
				"#fbedfd",
				"#f2c9fa",
				"#e9a5f7",
				"#e081f4",
				"#d75cf1",
				"#ce38ee",
				"#c514eb",
				"#a611c7",
				"#880ea3",
				"#6a0b7e",
				"#4c085a",
				"#2d0536",
				"#0f0212",
			],
			[
				"black",
				"black",
				"black",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
			]
		);
		outside_province_chart = new Chart(province, province_config);
	}
	checker = 0;

	if (Object.keys(outside_philippines).length) {
		checker = Object.values(outside_philippines).reduce(
			(prev_value, current_value) => prev_value + current_value
		);
	}

	if (!checker) {
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"none";
	} else {
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"block";
		const philippines_config = set_pie(
			Object.keys(outside_philippines),
			Object.values(outside_philippines),
			[
				"#fdf4ed",
				"#fadfc9",
				"#f7caa5",
				"#f4b580",
				"#f19f5c",
				"#ee8a38",
				"#eb7514",
				"#c76311",
				"#a3510e",
				"#7e3f0b",
				"#5a2d08",
				"#361b05",
				"#120902",
			],
			[
				"black",
				"black",
				"black",
				"black",
				"black",
				"black",
				"black",
				"white",
				"white",
				"white",
				"white",
			]
		);

		outside_philippines_chart = new Chart(philippines, philippines_config);
	}
}

function weeks_contents_clicked(e) {
	const current_month =
		month.indexOf(months.querySelector(".months-text").innerText) + 1;
	const week_text_spans = weeks.querySelectorAll(".weeks-text span");
	const target = e.currentTarget.innerText.split("(");
	const { start, end } = {
		start: parseInt(e.currentTarget.getAttribute("start")),
		end: parseInt(e.currentTarget.getAttribute("end")),
	};
	selected_weeks = e.currentTarget;

	set_sickness_overtime(
		months.querySelector(".months-text").innerText,
		target[0],
		start,
		end
	);

	if (
		target[1] &&
		week_text_spans[0].innerText === target[0] &&
		week_text_spans[1].innerText === "(" + target[1]
	) {
		return;
	} else if (week_text_spans[0].innerText === target[0]) {
		return;
	}

	if (target[0]) {
		week_text_spans[0].innerText = target[0];
	}
	if (target[1]) {
		week_text_spans[1].innerText = "(" + target[1];
	} else {
		week_text_spans[1].innerText = "";
	}

	if (week_text_spans[0].innerText === "Today") {
		sick_surveee_chart.destroy();
		sick_department_chart.destroy();
		exposed_chart.destroy();
		outside_province_chart.destroy();
		outside_philippines_chart.destroy();

		set_healthy_sick_count();
		set_sickness_per_surveyees();
		set_sickness_per_department();
		set_exposed_per_department();
		set_traveled_per_department();
		set_employee_student_count();
		return;
	} else if (week_text_spans[0].innerText === "Whole Month") {
		monthly_sick_count_surveyees(current_month);
		monthly_sick_surveyees(current_month);
		monthly_sick_department(current_month);
		monthly_exposed(current_month);
		monthly_traveled(current_month);
		return;
	}

	weekly_sick_count_surveyees(current_month, start, end);
	weekly_sick_surveyees(current_month, start, end);
	weekly_sick_department(current_month, start, end);
	weekly_exposed(current_month, start, end);
	weekly_traveled(current_month, start, end);
}

async function update_college_clicked(e) {
	e.preventDefault();
	const input_population = {};
	const is_confirm = update_total_form.reportValidity();
	if (is_confirm) {
		for (const input of total_inputs) {
			input_population[input.id] = input.value;
		}

		const result = await HMWADataService.update_population(
			input_population,
			user_email
		);

		if (result && result.data.acknowledged) {
			const population_response = await HMWADataService.get_population(
				user_email
			);
			if (population_response && population_response.data) {
				population = population_response.data;
			}

			let week_text_spans = weeks.querySelectorAll(".weeks-text span");
			week_text_spans[0].innerText = "";
			week_text_spans[1].innerText = "";

			selected_weeks.click();

			await swal({
				title: "Success!",
				text: "College population update successful",
				icon: "success",
				buttons: false,
				timer: 3000,
			});
		}
	}
}

function user_form_clicked(e) {
	overlay.querySelector("#left").classList.remove("on-college");
	create_edit_form.parentNode.classList.remove("hidden");
	update_total_form.parentNode.classList.add("hidden");
	change_password_form.parentNode.classList.add("hidden");
}

async function update_total_clicked(e) {
	overlay.querySelector("#left").classList.add("on-college");
	create_edit_form.parentNode.classList.add("hidden");
	update_total_form.parentNode.classList.remove("hidden");
	change_password_form.parentNode.classList.add("hidden");
}

function change_password_clicked(e) {
	overlay.querySelector("#left").classList.remove("on-college");
	create_edit_form.parentNode.classList.add("hidden");
	update_total_form.parentNode.classList.add("hidden");
	change_password_form.parentNode.classList.remove("hidden");
}

async function update_admin_clicked(e) {
	e.preventDefault();
	const is_valid = change_password_form.reportValidity();
	if (is_valid) {
		const user = {
			username: user_email,
			old_password: admin_old_password.value,
			password: "",
		};

		if (admin_password.value === admin_repeat_password.value) {
			user.password = admin_repeat_password.value;
		}

		const result = await HMWADataService.update_admin(user, user_email);

		if (result && result.data.acknowledged) {
			admin_old_password.value = "";
			admin_password.value = "";
			admin_repeat_password.value = "";
			edit_target = "";
			await swal({
				title: "Success!",
				text: "Admin update successful",
				icon: "success",
				buttons: false,
				timer: 3000,
			});
		}
	}
}

function menu_icon_clicked(e) {
	if (e.target.classList.contains("fa-square-pen")) {
		menu_content.classList.toggle("hidden");
	}
}

function search_keyup(e) {
	const target = search.value;
	if (!target) {
		return display_users();
	}
	if (e.keyCode === 13) {
		if (search.reportValidity()) {
			const targets = [];
			if (!target) {
				return display_users();
			}
			user_content.innerHTML = "";
			users.forEach((user) => {
				if (user.includes(target)) {
					targets.push(user);
				}
			});
			let html = "";
			for (const user of targets) {
				html += `<div id="${user}"> 
				<span>${user}</span>
				<div>
					<i class="fa-solid fa-pen edit" target="${user}"></i>
					<i class="fa-solid fa-trash delete" target="${user}"></i>
				</div>
			</div>`;
			}
			user_content.innerHTML = html;

			const edits = document.querySelectorAll(".edit");
			const deletes = document.querySelectorAll(".delete");

			edits.forEach((edit) =>
				edit.addEventListener("click", user_edit_clicked)
			);
			deletes.forEach((_delete) =>
				_delete.addEventListener("click", user_delete_clicked)
			);
		}
	}
}

function overlay_clicked(e) {
	if (e.target.classList.contains("overlay")) {
		overlay.classList.add("hidden");
		document.body.style.overflow = "hidden auto";
	}
}

function eye_clicked(e) {
	if (e.target.classList.contains("fa-eye")) {
		e.target.classList.remove("fa-eye");
		e.target.classList.add("fa-eye-slash");
		document.getElementById(e.target.getAttribute("parent")).type = "text";
	} else {
		e.target.classList.add("fa-eye");
		e.target.classList.remove("fa-eye-slash");
		document.getElementById(e.target.getAttribute("parent")).type = "password";
	}
}

async function display_users() {
	let users_response = await HMWADataService.get_users(user_email);
	users = users_response.data;
	let html = "";
	for (const user of users) {
		html += `<div id="${user}"> 
				<span>${user}</span>
				<div>
					<i class="fa-solid fa-pen edit" target="${user}"></i>
					<i class="fa-solid fa-trash delete" target="${user}"></i>
				</div>
			</div>`;
	}
	user_content.innerHTML = html;

	const edits = document.querySelectorAll(".edit");
	const deletes = document.querySelectorAll(".delete");

	edits.forEach((edit) => edit.addEventListener("click", user_edit_clicked));
	deletes.forEach((_delete) =>
		_delete.addEventListener("click", user_delete_clicked)
	);
}

async function user_edit_clicked(e) {
	user_form.click();
	edit_target = e.target.getAttribute("target");
	create_edit.innerText = "Update User";
	submit.innerText = "update";
	username.value = edit_target;
	cancel.style.display = "block";
	repeat_password.disabled = true;
	repeat_password.parentNode.style.display = "none";
	password.parentNode.children[0].innerText = "Generated Password";
	password.readOnly = true;
	password.value = Math.random().toString(36).slice(-8);
}

async function cancel_clicked(e) {
	edit_target = "";
	cancel.style.display = "none";
	create_edit.innerText = "Create User";
	username.value = "";
	submit.innerText = "create";
	repeat_password.disabled = false;
	repeat_password.parentNode.style.display = "flex";
	password.parentNode.children[0].innerText = "Password";
	password.readOnly = false;
	password.value = "";
}

async function user_delete_clicked(e) {
	const target = e.target.getAttribute("target");
	const is_confirm = await swal({
		title: "Are you sure?",
		text: `You will be deleting ${target}`,
		icon: "warning",
		buttons: ["No, cancel it!", "Yes, I am sure"],
	});
	if (is_confirm) {
		const result = await HMWADataService.delete_user(target, user_email);
		if (result && result.data.acknowledged) {
			document.getElementById(target).remove();
		}
	}
}

async function users_clicked(e) {
	if (e.currentTarget.id === "users") {
		user_loading(true);
		overlay.classList.remove("hidden");
		document.body.style.overflow = "hidden";

		await display_users();
		user_loading(false);
	}
}

function clear_user_inputs(e) {
	username.value = "";
	password.value = "";
	repeat_password.value = "";
}

async function create_user() {
	const user = {
		username: username.value,
		password: "",
	};

	if (password.value === repeat_password.value) {
		user.password = repeat_password.value;
	}

	const result = await HMWADataService.create_user(user, user_email);

	if (result && result.data) {
		clear_user_inputs();
		display_users();
		await swal({
			title: "Success!",
			text: "User creation successful",
			icon: "success",
			buttons: false,
			timer: 3000,
		});
	}
}
async function update_user() {
	const user = {
		username: username.value,
		password: password.value,
	};

	submit.disabled = true;
	cancel.disabled = true;
	const result = await HMWADataService.update_user(user, user_email);

	if (result && result.data.acknowledged) {
		clear_user_inputs();
		display_users();
		submit.disabled = false;
		cancel.disabled = false;
		cancel.click();
		await swal({
			title: "Success!",
			text: "Issued User password change",
			icon: "success",
			buttons: false,
			timer: 3000,
		});
	}
}

async function submit_clicked(e) {
	e.preventDefault();
	const is_valid = create_edit_form.reportValidity();
	if (is_valid) {
		if (e.target.innerText == "create") {
			await create_user();
		} else {
			await update_user();
		}
	}
}

async function sign_out_clicked(e) {
	if (e.currentTarget.id === "sign_out") {
		let is_confirm = await swal({
			title: "Are you sure?",
			text: "You will be signed out",
			icon: "warning",
			buttons: ["No, i'll stay", "Yes, sign me out"],
		});
		if (is_confirm) {
			const result = await HMWADataService.logout(user_email);
			if (result && result.data.acknowledged) {
				sessionStorage.clear();
				window.location.href = "/index.html";
			}
		}
	}
}

function dropdown_clicked(e, dropdown) {
	if (dropdown.classList.contains("surveyee")) {
		const parent = e.currentTarget.parentNode.parentNode.parentNode.parentNode;
		if (!parent.querySelector(".surveyee-text").classList.contains("active")) {
			parent.querySelector(".surveyee-text").classList.toggle("active");
			parent.querySelector(".surveyee-content").classList.toggle("hidden");
		}

		if (surveyees.scrollHeight > surveyees.clientHeight) {
			surveyees.style.paddingRight = "16px";
		} else {
			surveyees.style.paddingRight = "0px";
		}
	}

	dropdown.parentNode
		.querySelector(".dropdown-contents")
		.classList.toggle("hidden");
	dropdown.classList.toggle("active");
}

function content_clicked(e) {
	const parent = e.currentTarget.parentNode.parentNode;

	if (parent.classList.contains("department")) {
		const department = e.target.innerText;
		parent.querySelector(".dropdown-text span").innerText = department;
		[...surveyees.children].forEach((surveyee) => {
			if (!surveyee.classList.contains(department.replaceAll(" ", "-"))) {
				surveyee.style.display = "none";
			} else {
				surveyee.style.display = "block";
			}
		});
	} else {
		const index = e.target.getAttribute("index");
		parent.querySelector(".dropdown-text span").innerText = e.target.innerText;
		const department = document.querySelector(".dropdown-text span").innerText;
		const surveyee = parent.parentNode.parentNode
			.querySelector(".surveyee-text span")
			.innerText.toLowerCase();

		let experiences =
			reports[department][surveyee].assessments[index].experiences;
		let is_exposed =
			reports[department][surveyee].assessments[index].is_exposed;
		let traveled = reports[department][surveyee].assessments[index].traveled;

		let checkboxes = document
			.getElementById(reports[department][surveyee].information.email)
			.querySelectorAll(
				".surveyee-content .form-readonly:last-child .form-group input[type='checkbox']"
			);
		let exposed_radio_buttons = document
			.getElementById(reports[department][surveyee].information.email)
			.querySelectorAll(
				".surveyee-content .form-readonly:last-child .form-group.exposed-input input[type='radio']"
			);
		let traveled_radio_buttons = document
			.getElementById(reports[department][surveyee].information.email)
			.querySelectorAll(
				".surveyee-content .form-readonly:last-child .form-group.traveled-input input[type='radio']"
			);

		checkboxes.forEach((checkbox) => {
			checkbox.removeAttribute("checked");
		});
		exposed_radio_buttons.forEach((radio) => {
			radio.removeAttribute("checked");
		});
		traveled_radio_buttons.forEach((radio) => {
			radio.removeAttribute("checked");
		});

		experiences.forEach((experience) => {
			switch (experience) {
				case "Fever":
					checkboxes[0].setAttribute("checked", "checked");
					break;
				case "Dry cough":
					checkboxes[1].setAttribute("checked", "checked");
					break;
				case "Fatigue":
					checkboxes[2].setAttribute("checked", "checked");
					break;
				case "Body aches and pains":
					checkboxes[3].setAttribute("checked", "checked");
					break;
				case "Runny nose":
					checkboxes[4].setAttribute("checked", "checked");
					break;
				case "Sore throat":
					checkboxes[5].setAttribute("checked", "checked");
					break;
				case "Shortness of breath":
					checkboxes[6].setAttribute("checked", "checked");
					break;
				case "Headache":
					checkboxes[7].setAttribute("checked", "checked");
					break;
				case "Loss of smell":
					checkboxes[8].setAttribute("checked", "checked");
					break;
				case "Loss of taste":
					checkboxes[9].setAttribute("checked", "checked");
					break;
				default:
			}
		});

		if (is_exposed) {
			exposed_radio_buttons[0].setAttribute("checked", "checked");
		} else {
			exposed_radio_buttons[1].setAttribute("checked", "checked");
		}

		if (traveled.has_traveled) {
			let location = traveled.location.replace("outside ", "");
			switch (location) {
				case "province":
					traveled_radio_buttons[0].setAttribute("checked", "checked");
					break;
				case "philippines":
					traveled_radio_buttons[1].setAttribute("checked", "checked");
					break;
				default:
			}
		} else {
			traveled_radio_buttons[2].setAttribute("checked", "checked");
		}
	}

	if (surveyees.scrollHeight > surveyees.clientHeight) {
		surveyees.style.paddingRight = "16px";
	} else {
		surveyees.style.paddingRight = "0px";
	}
}

function window_clicked(e) {
	if (!e.target.classList.contains("dropdown-text")) {
		const dropdowns = document.querySelectorAll(".dropdown");
		dropdowns.forEach((dropdown) => {
			dropdown.querySelector(".dropdown-contents").classList.add("hidden");
			dropdown.querySelector(".dropdown-text").classList.remove("active");
		});
	}

	if (
		e.target !== months.querySelector(".months-text") &&
		!months.querySelector(".months-contents").classList.contains("hidden")
	) {
		months.querySelector(".months-text").classList.remove("active");
		months.querySelector(".months-contents").classList.add("hidden");
	}

	if (
		e.target !== weeks.querySelector(".weeks-text") &&
		!weeks.querySelector(".weeks-contents").classList.contains("hidden")
	) {
		weeks.querySelector(".weeks-text").classList.remove("active");
		weeks.querySelector(".weeks-contents").classList.add("hidden");
	}

	if (e.target !== menu_icon && !menu_content.classList.contains("hidden")) {
		menu_content.classList.add("hidden");
	}
}

function set_surveyees() {
	let department = document
		.querySelector(".dropdown-text span")
		.innerText.replaceAll(" ", "-");

	[...surveyees.children].forEach((surveyee) => {
		if (!surveyee.classList.contains(department)) {
			surveyee.style.display = "none";
		}
	});

	if (surveyees.scrollHeight > surveyees.clientHeight) {
		surveyees.style.paddingRight = "16px";
	}

	[...surveyees.children].forEach((surveyee) => {
		surveyee
			.querySelector(".surveyee-text")
			.addEventListener("click", (e) => surveyee_clicked(e, surveyee));
	});

	const dropdowns = document.querySelectorAll(".dropdown-text");
	const dropdown_contents = document.querySelectorAll(".dropdown-contents");

	dropdowns.forEach((dropdown) =>
		dropdown.addEventListener("click", (e) => dropdown_clicked(e, dropdown))
	);
	dropdown_contents.forEach((contents) => {
		[...contents.children].forEach((content) =>
			content.addEventListener("click", content_clicked)
		);
	});
}

function surveyee_clicked(e, surveyee) {
	if (
		e.target == surveyee.querySelector(".surveyee-text") ||
		e.target == surveyee.querySelector(".surveyee-text div")
	) {
		surveyee.querySelector(".surveyee-content").classList.toggle("hidden");
		e.currentTarget.classList.toggle("active");

		if (surveyees.scrollHeight > surveyees.clientHeight) {
			surveyees.style.paddingRight = "16px";
		} else {
			surveyees.style.paddingRight = "0px";
		}
	}
}

let departments_abbreviations = [
	"CAMP",
	"CAS",
	"CBA",
	"CCS",
	"CCJE",
	"CEA",
	"COE",
	"CON",
	"SOL",
	"SOM",
	"GS",
	"IS",
	"NP",
];

let sicknesses = [
	"Fever",
	"Dry cough",
	"Fatigue",
	"Body aches and pains",
	"Runny nose",
	"Sore throat",
	"Shortness of breath",
	"Diarrhea",
	"Headache",
	"Loss of smell",
	"Loss of taste",
	"None of the above",
];

function set_employee_student_count() {
	let employee_count = 0;
	let student_count = 0;

	for (const department of departments) {
		for (const surveyee of Object.keys(reports[department])) {
			if (reports[department][surveyee].information.position == "Employee") {
				employee_count++;
			} else {
				student_count++;
			}
		}
	}

	const h1_employee = document.getElementById("employee-count");
	const h1_student = document.getElementById("student-count");
	h1_employee.innerText = employee_count;
	h1_student.innerText = student_count;
}

const legend_margin = {
	id: "legend_margin",
	beforeInit(chart, options) {
		const fit_value = chart.legend.fit;
		chart.legend.fit = function fit() {
			fit_value.bind(chart.legend)();
			return (this.height += 30);
		};
	},
};

const set_pie = (labels, values, background_color, data_label_colors) => {
	const data = {
		labels: labels,
		datasets: [
			{
				data: values,
				backgroundColor: background_color,
				hoverOffset: 15,
				borderWidth: 0,
			},
		],
	};

	const legend_hover = (e, item, legend) => {
		legend.chart.data.datasets[0].backgroundColor.forEach(
			(color, index, colors) => {
				colors[index] =
					index === item.index || color.length === 9 ? color : color + "8D";
			}
		);
		legend.chart.update();
	};

	const legend_leave = (evt, item, legend) => {
		legend.chart.data.datasets[0].backgroundColor.forEach(
			(color, index, colors) => {
				colors[index] = color.length === 9 ? color.slice(0, -2) : color;
			}
		);
		legend.chart.update();
	};

	let not_mobile = true;
	if (window.innerWidth <= 800 && window.innerHeight <= 900) {
		not_mobile = false;
	}

	const options = {
		responsive: true,
		animation: false,
		layout: {
			padding: {
				left: 10,
				right: 10,
				bottom: 10,
			},
		},
		plugins: {
			legend: {
				display: not_mobile,
				labels: {
					color: "white",
					font: {
						family: "Poppins",
						size: 18,
						weight: 200,
					},
					usePointStyle: true,
					boxWidth: 25,
					padding: 25,
				},
				onHover: legend_hover,
				onLeave: legend_leave,
			},
			tooltip: {
				bodyFont: {
					family: "Poppins",
					size: 18,
					weight: 200,
					lineHeight: 1.7,
				},
				bodyFontSize: 14,
				bodyAlign: "center",
				displayColors: false,
				padding: 12,
				callbacks: {
					label: function (context) {
						let label = context.label;
						let value = context.formattedValue;
						return `${label}: ${value - 1}`;
					},
				},
			},
			datalabels: {
				anchor: "middle",
				formatter: (value, context) => {
					let sum = 0;
					let data_arr = context.chart.data.datasets[0].data;
					data_arr.forEach((data) => {
						sum += data - 1;
					});
					return (((value - 1) * 100) / sum).toFixed(2) + "%";
				},
				font: {
					family: "Poppins",
					size: 16,
					weight: 400,
				},
				color: data_label_colors,
			},
		},
	};

	const config = {
		type: "pie",
		data: data,
		options: options,
		plugins: [legend_margin, ChartDataLabels],
	};

	return config;
};

const set_bar = (
	labels,
	values,
	background_color,
	data_label_colors,
	tooltip_labels
) => {
	const data = {
		labels: labels,
		datasets: [
			{
				data: values,
				backgroundColor: background_color,
				hoverOffset: 15,
				borderWidth: 0,
			},
		],
	};

	let label_size = 18;
	if (window.innerWidth <= 800 && window.innerHeight <= 900) {
		label_size = 15;
	}

	const options = {
		indexAxis: "y",
		responsive: true,
		animation: false,
		plugins: {
			legend: false,
			tooltip: {
				bodyFont: {
					family: "Poppins",
					size: 18,
					weight: 200,
					lineHeight: 1.7,
				},
				bodyFontSize: 14,
				bodyAlign: "center",
				displayColors: false,
				padding: 12,
				callbacks: {
					title: () => {},
					label: function (context) {
						let label = context.label;
						if (label == "NTP") {
							return `${label}: ${tooltip_labels[label]} / ${
								Object.keys(reports["Non-teaching Personnel"]).length
							}`;
						}
						return `${label}: ${tooltip_labels[label]} / ${
							population[label.toLowerCase()]
						}`;
					},
				},
			},
			datalabels: {
				anchor: "middle",
				font: {
					family: "Poppins",
					size: label_size,
					weight: 400,
				},
				formatter: (value, context) => {
					return value + "%";
				},
				color: data_label_colors,
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				grid: {
					display: false,
				},
				ticks: {
					font: {
						family: "Poppins",
						size: label_size,
						weight: 200,
					},
					color: "white",
					stepSize: 10,
				},
			},
			y: {
				grid: {
					drawBorder: false,
				},
				ticks: {
					font: {
						family: "Poppins",
						size: label_size,
						weight: 200,
					},
					color: "white",
				},
			},
		},
	};

	const config = {
		type: "bar",
		data: data,
		options: options,
		plugins: [ChartDataLabels],
	};

	return config;
};

const set_line = (labels, values_1, values_2) => {
	const data = {
		labels: labels,
		datasets: [
			{
				label: "Sick",
				data: values_2,
				borderColor: "#c4142f",
				backgroundColor: "#c4142e60",
			},
			{
				label: "Healthy",
				data: values_1,
				borderColor: "#00bf6c",
				backgroundColor: "#00bf6e60",
			},
		],
	};

	let label_size = 18;
	if (window.innerWidth <= 800 && window.innerHeight <= 900) {
		label_size = 10;
	}

	const options = {
		responsive: true,
		animation: false,
		plugins: {
			legend: {
				display: label_size === 10 ? false : true,
				labels: {
					color: "white",
					font: {
						family: "Poppins",
						size: 18,
						weight: 200,
					},
					usePointStyle: true,
					boxWidth: 25,
					padding: 25,
				},
			},
			tooltip: {
				titleFont: {
					family: "Poppins",
					size: 18,
					weight: 400,
					lineHeight: 1.7,
				},
				bodyFont: {
					family: "Poppins",
					size: 18,
					weight: 200,
					lineHeight: 1.7,
				},
				bodyFontSize: 14,
				bodyAlign: "left",
				displayColors: false,
				padding: 12,
				callbacks: {
					title: function (context) {
						let title = context[0].label;
						return title;
					},
					label: function (context) {
						let label = context.dataset.label;
						let value = context.formattedValue;
						return `${label}: ${value}`;
					},
				},
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				grid: {
					display: false,
				},
				ticks: {
					font: {
						family: "Poppins",
						size: label_size,
						weight: 200,
					},
					color: "#fff",
				},
			},
			y: {
				beginAtZero: true,
				grid: {
					drawBorder: false,
				},
				ticks: {
					font: {
						family: "Poppins",
						size: label_size,
						weight: 200,
					},
					color: "white",
					precision: 0,
				},
			},
		},
	};

	const config = {
		type: "line",
		data: data,
		options: options,
		plugins: [label_size === 10 ? "" : legend_margin],
	};

	return config;
};

function set_colleges() {
	let colleges = document.getElementById("colleges").getContext("2d");
	let values = {};

	let index = 0;
	for (const department of departments) {
		values[departments_abbreviations[index]] = Object.values(
			reports[department]
		).length;
		index++;
	}

	let checker = Object.values(values).reduce(
		(prev_value, current_value) => prev_value + current_value
	);

	if (!checker) {
		document.getElementById("colleges").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("colleges").parentNode.parentNode.style.display =
			"block";
	}

	const temp_np = values["NP"];
	delete values["NP"];
	values["NTP"] = temp_np;

	Object.keys(values).forEach((value) => {
		if (!values[value]) {
			delete values[value];
		} else {
			values[value]++;
		}
	});

	const config = set_pie(
		Object.keys(values),
		Object.values(values),
		[
			"#efecfe",
			"#cec7fc",
			"#ada2fa",
			"#8d7cf8",
			"#6c57f6",
			"#4b32f4",
			"#2b0df2",
			"#240bcd",
			"#1e09a8",
			"#170782",
			"#10055d",
			"#0a0338",
			"#030113",
		],
		[
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
		]
	);

	new Chart(colleges, config);
}

function set_healthy_sick_count() {
	const healthy_surveyees = document.getElementById("safe-count");
	const sick_surveyees = document.getElementById("sick-count");

	let healthy = 0;
	let sick = 0;

	for (const department of departments) {
		for (const surveyee of Object.keys(reports[department])) {
			for (const assessment of reports[department][surveyee].assessments) {
				if (assessment.date === today) {
					if (assessment.experiences.includes("None of the above")) {
						healthy++;
					} else {
						sick++;
					}
					break;
				}
			}
		}
	}

	healthy_surveyees.innerText = healthy;
	sick_surveyees.innerText = sick;
}

function set_sickness_overtime(current_month, target, start, end) {
	if (overtime_chart instanceof Chart) {
		overtime_chart.destroy();
	}
	const parent = document.querySelector(".line");
	if (target === "Today") {
		parent.style.display = "none";
		return;
	}

	parent.style.display = "block";

	const overtime = document.getElementById("overtime").getContext("2d");
	let labels = [];
	for (let i = start; i <= end; i++) {
		labels.push(`${month[month.indexOf(current_month)]} ${i}`);
	}

	let sickness_values = [];
	let healthy_values = [];
	healthy_surveyees_tooltip = {};
	sick_surveyees_tooltip = {};

	if (end) {
		current_month = month.indexOf(current_month) + 1;
		for (const date of labels) {
			const target_day = parseInt(date.split(" ")[1]);
			let total_healthy = 0;
			let total_sickness = 0;
			for (const department of departments) {
				for (const surveyee of Object.keys(reports[department])) {
					for (const assessment of reports[department][surveyee].assessments) {
						const date = assessment.date.split("-");
						const { month, day } = {
							month: parseInt(date[1]),
							day: parseInt(date[2]),
						};
						if (month === current_month && day === target_day) {
							if (!assessment.experiences.includes("None of the above")) {
								total_sickness++;
								if (sick_surveyees_tooltip[day] === undefined) {
									sick_surveyees_tooltip[day] = {};
								}
								if (sick_surveyees_tooltip[day][department] === undefined) {
									sick_surveyees_tooltip[day][department] = [];
								}
								sick_surveyees_tooltip[day][department].push(surveyee);
							} else {
								total_healthy++;
								if (healthy_surveyees_tooltip[day] === undefined) {
									healthy_surveyees_tooltip[day] = {};
								}
								if (healthy_surveyees_tooltip[day][department] === undefined) {
									healthy_surveyees_tooltip[day][department] = [];
								}
								healthy_surveyees_tooltip[day][department].push(surveyee);
							}
							break;
						}
					}
				}
			}
			healthy_values.push(total_healthy);
			sickness_values.push(total_sickness);
		}
	}
	if (target === "Whole Month") {
		labels = [];
		const month_index = month.indexOf(current_month);
		const current_year = new Date().getFullYear();
		const month_weeks = get_weeks_start_and_end_in_month(
			month_index,
			current_year
		);
		Object.keys(month_weeks).forEach((index) => {
			index = parseInt(index);
			index++;
			const start = month_weeks[index - 1].start;
			const end = month_weeks[index - 1].end;
			labels.push(`${current_month} ${start}-${end}`);
		});
		current_month = month.indexOf(current_month) + 1;
		for (const week of month_weeks) {
			let week_sick_counter = 0;
			let week_healthy_counter = 0;
			for (const department of departments) {
				for (const surveyee of Object.keys(reports[department])) {
					let healthy_checker = 0;
					let sick_checker = 0;
					let healthy_counter = 0;
					let sick_counter = 0;
					for (const assessment of reports[department][surveyee].assessments) {
						const date = assessment.date.split("-");
						const { month, day } = {
							month: parseInt(date[1]),
							day: parseInt(date[2]),
						};

						if (
							month === current_month &&
							day >= week.start &&
							day <= week.end
						) {
							if (assessment.experiences.includes("None of the above")) {
								if (!healthy_checker) {
									healthy_checker++;
									healthy_counter = day;
								}
							} else {
								if (!sick_checker) {
									sick_checker++;
									sick_counter = day;
								}
							}
							if (healthy_checker && sick_checker) {
								break;
							}
						}
					}
					if (healthy_counter === 0 && sick_counter === 0) {
						continue;
					}
					if (healthy_counter > sick_counter) {
						week_healthy_counter++;
					} else {
						week_sick_counter++;
					}
				}
			}
			healthy_values.push(week_healthy_counter);
			sickness_values.push(week_sick_counter);
		}
	}

	let healthy_checker = Object.values(healthy_values).reduce(
		(prev_value, current_value) => prev_value + current_value
	);
	let sick_checker = Object.values(sickness_values).reduce(
		(prev_value, current_value) => prev_value + current_value
	);

	if (!healthy_checker && !sick_checker) {
		document.getElementById("overtime").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("overtime").parentNode.parentNode.style.display =
			"block";
	}

	const config = set_line(labels, healthy_values, sickness_values);
	overtime_chart = new Chart(overtime, config);
}

function set_sickness_per_surveyees() {
	const sickness = document.getElementById("sickness").getContext("2d");
	const temp_sicknesses = sicknesses.slice(0, sicknesses.length - 1);
	const values = {};
	for (const department of departments) {
		for (const surveyee of Object.keys(reports[department])) {
			for (const assessment of reports[department][surveyee].assessments) {
				if (assessment.date === today) {
					for (const sickness of temp_sicknesses) {
						if (!values[sickness] || values[sickness] == undefined) {
							values[sickness] = 0;
						}
						if (assessment.experiences.includes(sickness)) {
							values[sickness]++;
						}
					}
					break;
				}
			}
		}
	}

	if (!Object.keys(values).length) {
		document.getElementById("sickness").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("sickness").parentNode.parentNode.style.display =
			"block";
	}

	Object.keys(values).forEach((value, index) => {
		if (!values[value]) {
			delete values[value];
		} else {
			values[value]++;
		}
	});

	const config = set_pie(
		Object.keys(values),
		Object.values(values),
		[
			"#eafff6",
			"#bfffe3",
			"#95ffd1",
			"#6affbf",
			"#40ffac",
			"#15ff9a",
			"#00ea85",
			"#00bf6c",
			"#009554",
			"#006a3c",
			"#004024",
		],
		[
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
		]
	);

	sick_surveee_chart = new Chart(sickness, config);
}

function set_sickness_per_department() {
	const sick_count_department = document
		.getElementById("sickness-department")
		.getContext("2d");

	const values = {};

	let index = 0;
	for (const department of departments) {
		values[departments_abbreviations[index]] = 0;
		for (const surveyee of Object.keys(reports[department])) {
			for (const assessment of reports[department][surveyee].assessments) {
				if (assessment.date === today) {
					if (!assessment.experiences.includes("None of the above")) {
						values[departments_abbreviations[index]]++;
						break;
					}
				}
			}
		}
		index++;
	}

	let checker = Object.values(values).reduce(
		(prev_value, current_value) => prev_value + current_value
	);

	if (!checker) {
		document.getElementById(
			"sickness-department"
		).parentNode.parentNode.style.display = "none";
		return;
	} else {
		document.getElementById(
			"sickness-department"
		).parentNode.parentNode.style.display = "block";
	}

	const temp_np = values["NP"];
	delete values["NP"];
	values["NTP"] = temp_np;

	const tooltip_labels = {};
	Object.keys(values).forEach((value) => {
		if (!values[value]) {
			delete values[value];
		} else {
			tooltip_labels[value] = values[value];
			if (population[value.toLowerCase()]) {
				values[value] = (
					(values[value] / population[value.toLowerCase()]) *
					100
				).toFixed(2);
			} else {
				values[value] = (
					(values[value] /
						Object.keys(reports["Non-teaching Personnel"]).length) *
					100
				).toFixed(2);
			}
		}
	});

	let not_mobile = true;
	if (window.innerWidth <= 800 && window.innerHeight <= 900) {
		not_mobile = false;
	}

	if (Object.keys(values).length <= 1) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "80px");
	} else if (Object.keys(values).length <= 2) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "120px");
	} else if (Object.keys(values).length <= 3) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "180px");
	} else if (Object.keys(values).length <= 4) {
		document
			.getElementById("sickness-department")
			.setAttribute("height", "250px");
	} else {
		if (not_mobile) {
			document
				.getElementById("sickness-department")
				.setAttribute("height", "400px");
		} else {
			document
				.getElementById("sickness-department")
				.setAttribute("height", "700px");
		}
	}

	const config = set_bar(
		Object.keys(values),
		Object.values(values),
		[
			"#fdedf0",
			"#f9cad1",
			"#f6a6b2",
			"#f28394",
			"#ee5f75",
			"#eb3b56",
			"#e71838",
			"#c4142f",
			"#a01127",
			"#7c0d1e",
			"#590915",
			"#35060d",
			"#120204",
		],
		[
			"black",
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
		],
		tooltip_labels
	);

	sick_department_chart = new Chart(sick_count_department, config);
}

function set_exposed_per_department() {
	const exposed = document.getElementById("exposed").getContext("2d");
	const is_exposed = {};
	let is_not_exposed = 0;
	let sum = 0;

	let index = 0;
	for (const department of departments) {
		is_exposed[departments_abbreviations[index]] = 0;
		for (const surveyee of Object.keys(reports[department])) {
			for (const assessment of reports[department][surveyee].assessments) {
				if (assessment.date === today) {
					if (assessment.is_exposed) {
						is_exposed[departments_abbreviations[index]]++;
						sum++;
					} else {
						is_not_exposed++;
					}
					break;
				}
			}
		}
		index++;
	}

	document.getElementById("not-exposed-count").innerText = is_not_exposed;
	document.getElementById("exposed-count").innerText = sum || 0;

	let checker = Object.values(is_exposed).reduce(
		(prev_value, current_value) => prev_value + current_value
	);

	if (!checker) {
		document.getElementById("exposed").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("exposed").parentNode.parentNode.style.display =
			"block";
	}

	const temp_np = values["NP"];
	delete values["NP"];
	values["NTP"] = temp_np;

	Object.keys(is_exposed).forEach((value) => {
		if (!is_exposed[value]) {
			delete is_exposed[value];
		} else {
			is_exposed[value]++;
		}
	});

	const config = set_pie(
		Object.keys(is_exposed),
		Object.values(is_exposed),
		[
			"#fdfeed",
			"#fafbc8",
			"#f7f9a3",
			"#f4f67f",
			"#f1f35a",
			"#edf135",
			"#eaee11",
			"#c6ca0e",
			"#a2a50c",
			"#7e8009",
			"#5a5c06",
			"#5a5c06",
			"#363704",
		],
		[
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"black",
			"white",
			"white",
			"white",
			"white",
			"white",
			"white",
		]
	);

	exposed_chart = new Chart(exposed, config);
}

function set_traveled_per_department() {
	const province = document.getElementById("province").getContext("2d");
	const philippines = document.getElementById("philippines").getContext("2d");
	let has_traveled = 0;
	let has_not_traveled = 0;
	const outside_province = {};
	const outside_philippines = {};

	let index = 0;
	for (const department of departments) {
		outside_province[departments_abbreviations[index]] = 0;
		outside_philippines[departments_abbreviations[index]] = 0;
		for (const surveyee of Object.keys(reports[department])) {
			for (const assessment of reports[department][surveyee].assessments) {
				if (assessment.date === today) {
					if (assessment.traveled.has_traveled) {
						has_traveled++;
						if (assessment.traveled.location == "outside province") {
							outside_province[departments_abbreviations[index]]++;
						} else {
							outside_philippines[departments_abbreviations[index]]++;
						}
					} else {
						has_not_traveled++;
					}
					break;
				}
			}
		}
		index++;
	}

	document.getElementById("sheltered-count").innerText = has_not_traveled;
	document.getElementById("traveled-count").innerText = has_traveled;

	if (!has_traveled) {
		document.getElementById("province").parentNode.parentNode.style.display =
			"none";
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"none";
		return;
	} else {
		document.getElementById("province").parentNode.parentNode.style.display =
			"block";
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"block";
	}

	const temp_np = outside_province["NP"];
	delete outside_province["NP"];
	outside_province["NTP"] = temp_np;

	temp_np = outside_philippines["NP"];
	delete outside_philippines["NP"];
	outside_philippines["NTP"] = temp_np;

	Object.keys(outside_province).forEach((key) => {
		if (!outside_province[key]) {
			delete outside_province[key];
		} else {
			outside_province[key]++;
		}
	});
	Object.keys(outside_philippines).forEach((key) => {
		if (!outside_philippines[key]) {
			delete outside_philippines[key];
		} else {
			outside_philippines[key]++;
		}
	});

	let checker = 0;

	if (Object.keys(outside_province).length) {
		checker = Object.values(outside_province).reduce(
			(prev_value, current_value) => prev_value + current_value
		);
	}

	if (!checker) {
		document.getElementById("province").parentNode.parentNode.style.display =
			"none";
	} else {
		document.getElementById("province").parentNode.parentNode.style.display =
			"block";

		const province_config = set_pie(
			Object.keys(outside_province),
			Object.values(outside_province),
			[
				"#fbedfd",
				"#f2c9fa",
				"#e9a5f7",
				"#e081f4",
				"#d75cf1",
				"#ce38ee",
				"#c514eb",
				"#a611c7",
				"#880ea3",
				"#6a0b7e",
				"#4c085a",
				"#2d0536",
				"#0f0212",
			],
			[
				"black",
				"black",
				"black",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
				"white",
			]
		);
		outside_province_chart = new Chart(province, province_config);
	}
	checker = 0;

	if (Object.keys(outside_philippines).length) {
		checker = Object.values(outside_philippines).reduce(
			(prev_value, current_value) => prev_value + current_value
		);
	}

	if (!checker) {
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"none";
	} else {
		document.getElementById("philippines").parentNode.parentNode.style.display =
			"block";

		const philippines_config = set_pie(
			Object.keys(outside_philippines),
			Object.values(outside_philippines),
			[
				"#fdf4ed",
				"#fadfc9",
				"#f7caa5",
				"#f4b580",
				"#f19f5c",
				"#ee8a38",
				"#eb7514",
				"#c76311",
				"#a3510e",
				"#7e3f0b",
				"#5a2d08",
				"#361b05",
				"#120902",
			],
			[
				"black",
				"black",
				"black",
				"black",
				"black",
				"black",
				"black",
				"white",
				"white",
				"white",
				"white",
			]
		);

		outside_philippines_chart = new Chart(philippines, philippines_config);
	}
}

function set_report_views() {
	const surveyee_content = document.querySelector(".surveyees");

	for (const department of departments) {
		for (const surveyee of Object.keys(reports[department])) {
			let index = 0;
			let dates = "";

			if (reports[department][surveyee].assessments.length) {
				reports[department][surveyee].assessments.forEach(
					(assessment, index) => {
						dates += `<span index="${index}">${assessment.date}</span>`;
					}
				);

				let html = `<div class="surveyee ${department.replaceAll(
					" ",
					"-"
				)}" id="${reports[department][surveyee].information.email}">
				<div class="surveyee-text">
					<span>${surveyee}</span>
					<div>
						<div class="surveyee dropdown">
							<div class="surveyee dropdown-text">
								<span>${reports[department][surveyee].assessments[index].date}</span>
								<i class="fa-solid fa-chevron-down"></i>
							</div>
							<div class="surveyee dropdown-contents hidden">
								<div>
									${dates}
								</div>
							</div>
						</div>
						<i class="fa-solid fa-chevron-down"></i>
					</div>
				</div>
				<div class="surveyee-content hidden">
					<form class="form-readonly">
						<div class="form-group">
							<label for="sex">Sex</label>
							<input name="sex" class="text-input" value="${
								reports[department][surveyee].information.sex
							}" readonly />
						</div>
						<div class="form-group">
							<label for="age">Age</label>
							<input name="age" class="text-input" value="${
								reports[department][surveyee].information.age
							}" readonly />
						</div>
						<div class="form-group">
							<label for="contact_number">Contact Number</label>
							<input name="contact_number" class="text-input" value="${
								reports[department][surveyee].information.contact_number
							}" readonly />
						</div>
						<div class="form-group">
							<label for="email">Email</label>
							<input name="email" class="text-input" value="${
								reports[department][surveyee].information.email
							}" readonly />
						</div>
						<div class="form-group">
							<label for="address">Address</label>
							<textarea name="address" class="textarea-input" rows="2" readonly>${
								reports[department][surveyee].information.address
							}</textarea>
						</div>
						<div class="form-group">
							<label for="position">AUF</label>
							<input name="position" class="text-input" value="${
								reports[department][surveyee].information.position
							}" readonly />
						</div>
					</form>
					<form class="form-readonly">
						<div class="form-group">
							<p>Have you experienced any of the following in the last 14 days? (check all that apply)</p>
							<label>
								<input type='checkbox' name='experiences' class='checkbox-input' value='Fever'>
								Fever
							</label>
							<label>
								<input type='checkbox' name='experiences' class='checkbox-input' value='Dry cough'>
								Dry cough
							</label>
							<label>
								<input type='checkbox' name='experiences' class='checkbox-input' value='Fatigue'>
								Fatigue
							</label>
							<label>
								<input type='checkbox' name='experiences' class='checkbox-input' value='Body aches and pains'>
								Body aches and pains
							</label>
							<label>
								<input type='checkbox' name='experiences' class='checkbox-input' value='Runny nose'>
								Runny nose
							</label>
							<label>
								<input type='checkbox' name='experiences' class='checkbox-input' value='Sore throat'>
								Sore throat
							</label>
							<label>
								<input type='checkbox' name='experiences' class='checkbox-input' value='Shortness of breath'>
								Shortness of breath
							</label>
							<label>
								<input type='checkbox' name='Diarrhea' class='checkbox-input' value='Diarrhea'>
								Diarrhea
							</label>
							<label>
								<input type='checkbox' name='Headache' class='checkbox-input' value='Headache'>
								Headache
							</label>
							<label>
								<input type='checkbox' name='Loss of smell' class='checkbox-input' value='Loss of smell'>
								Loss of smell
							</label>
							<label>
								<input type='checkbox' name='Loss of taste' class='checkbox-input' value='Loss of taste'>
								Loss of taste
							</label>
						</div>

						<div class="form-group exposed-input">
							<p>Have you been exposed to someone with confirmed COVID-19 in the past 14 days?</p>
							<label>
								<input type='radio' name='exposed-input' class="radio-input" value="exposed" >
								Yes
							</label>
							<label>
								<input type='radio' name='exposed-input' class="radio-input" value="not exposed">
								No
							</label>
						</div>

						<div class="form-group traveled-input">
							<p>Have you traveled outside of your province or the Philippines in the last 14 days?</p>
							<label>
								<input type='radio' name='traveled-input' class="radio-input" value="outside province">
								Yes, outside the province
							</label>
							<label>
								<input type='radio' name='traveled-input' class="radio-input" value="outside philippines">
								Yes, outside the Philippines
							</label>
							<label>
								<input type='radio' name='traveled-input' class="radio-input" value="not traveled">
								No
							</label>
						</div>
					</form>
				</div>
			</div>`;
				surveyee_content.innerHTML += html;

				let experiences =
					reports[department][surveyee].assessments[index].experiences;
				let is_exposed =
					reports[department][surveyee].assessments[index].is_exposed;
				let traveled =
					reports[department][surveyee].assessments[index].traveled;
				let checkboxes = document
					.getElementById(reports[department][surveyee].information.email)
					.querySelectorAll(
						".form-readonly .form-group input[type='checkbox']"
					);
				let exposed_radio_buttons = document
					.getElementById(reports[department][surveyee].information.email)
					.querySelectorAll(
						".form-readonly .form-group.exposed-input input[type='radio']"
					);

				let traveled_radio_buttons = document
					.getElementById(reports[department][surveyee].information.email)
					.querySelectorAll(
						".form-readonly .form-group.traveled-input input[type='radio']"
					);

				experiences.forEach((experience) => {
					switch (experience) {
						case "Fever":
							checkboxes[0].setAttribute("checked", "checked");
							break;
						case "Dry cough":
							checkboxes[1].setAttribute("checked", "checked");
							break;
						case "Fatigue":
							checkboxes[2].setAttribute("checked", "checked");
							break;
						case "Body aches and pains":
							checkboxes[3].setAttribute("checked", "checked");
							break;
						case "Runny nose":
							checkboxes[4].setAttribute("checked", "checked");
							break;
						case "Sore throat":
							checkboxes[5].setAttribute("checked", "checked");
							break;
						case "Shortness of breath":
							checkboxes[6].setAttribute("checked", "checked");
							break;
						case "Headache":
							checkboxes[7].setAttribute("checked", "checked");
							break;
						case "Loss of smell":
							checkboxes[8].setAttribute("checked", "checked");
							break;
						case "Loss of taste":
							checkboxes[9].setAttribute("checked", "checked");
							break;
						default:
					}
				});

				if (is_exposed) {
					exposed_radio_buttons[0].setAttribute("checked", "checked");
				} else {
					exposed_radio_buttons[1].setAttribute("checked", "checked");
				}

				if (traveled.has_traveled) {
					let location = traveled.location.replace("outside ", "");
					switch (location) {
						case "province":
							traveled_radio_buttons[0].setAttribute("checked", "checked");
							break;
						case "philippines":
							traveled_radio_buttons[1].setAttribute("checked", "checked");
							break;
						default:
					}
				} else {
					traveled_radio_buttons[2].setAttribute("checked", "checked");
				}
			}
		}
	}
}

function user_loading(is_loading = true) {
	if (is_loading) {
		overlay_loading.style.display = "flex";
		user_content.style.display = "none";
	} else {
		overlay_loading.style.display = "none";
		user_content.style.display = "flex";
	}
}

function is_loading(is_loading = true) {
	if (is_loading) {
		dashboard.style.display = "none";
		loading.style.display = "flex";
	} else {
		dashboard.style.display = "block";
		loading.style.display = "none";
	}
}

async function download_data(e) {
	e.preventDefault();
	let value = await swal({
		title: "Are you sure?",
		text: "You will be downloading all surveyees' information and assessments.",
		icon: "warning",
		buttons: {
			button_one: {
				text: "No, cancel it!",
				value: "",
				visible: true,
				className: "swal-button--cancel",
				closeModal: true,
			},
			button_two: {
				text: "No, selected department only!",
				value: "selected",
				visible: true,
				className: "swal-button--confirm",
				closeModal: true,
			},
			button_three: {
				text: "Yes, I am sure",
				value: "all",
				visible: true,
				className: "swal-button--confirm",
				closeModal: true,
			},
		},
	});
	let response = {};
	let department = "Departments";
	if (value === "all") {
		response = await HMWADataService.download_surveyee_assessment(
			"",
			user_email
		);
	} else if (value === "selected") {
		department = document.querySelector(
			".department .dropdown-text span"
		).innerText;
		response = await HMWADataService.download_surveyee_assessment(
			department,
			user_email
		);
	} else {
		return;
	}
	const url = window.URL.createObjectURL(new Blob([response.data]));
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", `${department}.zip`);
	document.body.appendChild(link);
	link.click();
	link.remove();
}

function get_weeks_start_and_end_in_month(month, year) {
	let weeks = [];
	let firstDate = new Date(year, month, 1);
	let lastDate = new Date(year, month + 1, 0);
	let numDays = lastDate.getDate();

	let start = 1;
	let end = 7 - firstDate.getDay();
	while (start <= numDays) {
		weeks.push({ start: start, end: end });
		start = end + 1;
		end = end + 7;
		end = start === 1 && end === 8 ? 1 : end;
		if (end > numDays) {
			end = numDays;
		}
	}
	return weeks;
}

function init_months_weeks() {
	const month_index = new Date().getMonth();
	const current_month = month[month_index];
	const current_year = new Date().getFullYear();
	months.querySelector(".months-text span").innerText = current_month;
	const month_weeks = get_weeks_start_and_end_in_month(
		month_index,
		current_year
	);
	const weeks_content = weeks.querySelector(".weeks-contents");
	let week_html = "<span>Today</span>";
	Object.keys(month_weeks).forEach((index) => {
		index = parseInt(index);
		index++;
		let placeholder = "";
		switch (index) {
			case 1:
				placeholder = "1st Week";
				break;
			case 2:
				placeholder = "2nd Week";
				break;
			case 3:
				placeholder = "3rd Week";
				break;
			default:
				placeholder = `${index}th Week`;
		}
		const start = month_weeks[index - 1].start;
		const end = month_weeks[index - 1].end;
		week_html += `<span start="${start}" end="${end}"><span>${placeholder}</span><span>(${start}-${end})</span></span>`;
	});
	week_html += "<span>Whole Month</span>";
	weeks_content.innerHTML = week_html;

	const weeks_contents = document.querySelectorAll(".weeks-contents > span");
	weeks_contents.forEach((week_content) => {
		week_content.addEventListener("click", weeks_contents_clicked);
	});
}

(async function () {
	is_loading(true);

	const surveyee_assessments_response =
		await HMWADataService.get_surveyee_assessment(user_email);

	if (surveyee_assessments_response && surveyee_assessments_response.data) {
		reports = surveyee_assessments_response.data.surveyees_assessments;
		departments = Object.keys(reports);
	}

	const population_response = await HMWADataService.get_population(user_email);
	if (population_response && population_response.data) {
		population = population_response.data;

		for (const input of total_inputs) {
			input.value = population[input.id];
		}
	}

	is_loading(false);

	if (surveyee_assessments_response && surveyee_assessments_response.data) {
		init_months_weeks();
		set_healthy_sick_count();
		set_sickness_per_surveyees();
		set_sickness_per_department();
		set_exposed_per_department();
		set_traveled_per_department();
		set_employee_student_count();
		set_colleges();
		set_report_views();
		set_surveyees();
	} else {
		document.querySelector(".view").remove();
	}

	if (surveyee_assessments_response.data.is_admin) {
		btn_users.classList.remove("hidden");
	} else {
		btn_users.innerHTML = "";
		document.querySelector(".overlay").remove();
		document.querySelector("header div:nth-child(2)").style.alignItems =
			"start";
	}
	btn_sign_out.classList.remove("hidden");
})();
