import HMWADataService from "./services/hmwa.js";

const user = { username: "", password: "" };
const txt_username = document.querySelector("form #username");
const txt_password = document.querySelector("form #password");
const admin_password = document.getElementById("admin-password");
const admin_repeat_password = document.getElementById("repeat-password");
const icon = document.querySelector(".icon");
const overlay_icon = document.querySelector(".overlay-icon");
const overlay = document.querySelector(".overlay");
const form = document.querySelector("main form");
const overlay_form = document.querySelector(".overlay form");
const eyes = document.querySelectorAll(".eye");
const submit_button = document.querySelector("main form button");
const register_button = document.querySelector(".overlay form button");

register_button.addEventListener("click", register);
submit_button.addEventListener("click", submit);
txt_username.addEventListener("focusout", focusout_txt_username);
txt_username.addEventListener("keyup", keyout_txt_username);
eyes.forEach((eye) => {
	eye.addEventListener("click", eye_clicked);
});

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

async function register_admin() {
	overlay.classList.remove("hidden");
}

async function keyout_txt_username(e) {
	if (e.keyCode === 13) {
		e.preventDefault();
		focusout_txt_username(e);
	}
}

async function focusout_txt_username(e) {
	user.username = txt_username.value;
	if (user.username === "Admin") {
		icon.classList.remove("fa-user-nurse");
		icon.classList.add("fa-user-tie");
	} else {
		if (!icon.classList.contains("fa-user-nurse")) {
			icon.classList.add("fa-user-nurse");
			icon.classList.remove("fa-user-tie");
		}
		txt_password.focus();
	}
}

async function register(e) {
	e.preventDefault();
	const password = admin_password.value;
	const repeat_password = admin_repeat_password.value;
	const is_valid = overlay_form.reportValidity();

	if (is_valid) {
		register_button.disabled = true;
		if (password === repeat_password) {
			user.password = repeat_password;

			await HMWADataService.register(user);
			register_button.disabled = false;
			swal({
				title: "Congratulations!",
				text: "Registration Success",
				icon: "success",
				timer: 3000,
				buttons: false,
			});
			admin_password.value = "";
			admin_repeat_password.value = "";
			overlay.classList.add("hidden");
		} else {
			register_button.disabled = false;
			swal({
				title: "Invalid inputs",
				text: "Passwords do not match.",
				icon: "error",
				timer: 3000,
				buttons: false,
			});
		}
	}
}

async function submit(e) {
	e.preventDefault();
	const is_valid = form.reportValidity();
	if (is_valid) {
		submit_button.disabled = true;
		user.username = txt_username.value;
		user.password = txt_password.value;
		const result = await HMWADataService.login(user);
		if (result.data && result.data.is_match) {
			submit_button.disabled = false;
			if (result.data.is_temporary !== undefined && result.data.is_temporary) {
				txt_password.value = "";
				overlay_icon.classList.remove("fa-user-tie");
				overlay_icon.classList.add("fa-user-nurse");
				return overlay.classList.remove("hidden");
			}
			sessionStorage.setItem("username", user.username);
			window.location.href = "/dashboard/dashboard.html";
		} else {
			submit_button.disabled = false;
			if (!result.data && user.username === "Admin") {
				swal({
					title: "Admin Not Found",
					text: "Please register to continue",
					icon: "warning",
					timer: 3000,
					buttons: false,
				});
				return await register_admin();
			}
			swal({
				title: "Invalid User",
				text: "Incorrect username or password",
				icon: "error",
				timer: 3000,
				buttons: false,
			});
		}
	}
}
