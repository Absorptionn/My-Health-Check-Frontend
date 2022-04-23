import http from "./http-common.js";

class HMWADataService {
	static get_population(username) {
		return http.get("/population", { params: { username } });
	}

	static update_population(population, target, username) {
		return http.put("/population", population, {
			params: { username, target },
		});
	}

	static create_user(user, username) {
		return http
			.post("/users", { user }, { params: { username } })
			.catch((error) => {
				swal({
					icon: "error",
					title: "Error",
					text: "User already exists",
					buttons: false,
				});
			});
	}

	static get_users(username) {
		return http.get("/users", { params: { username } });
	}

	static update_user(target, user, username) {
		return http.put("/users", { user }, { params: { target, username } });
	}

	static delete_user(target, username) {
		return http.delete("/users", { params: { target, username } });
	}

	static update_admin(user, username) {
		return http
			.put("/update/admin", { user }, { params: { username } })
			.catch((error) => {
				swal({
					title: "Error",
					text: "Incorrect old password",
					icon: "error",
					buttons: false,
				});
			});
	}

	static login(user) {
		return http.get("/login", { params: user });
	}

	static logout(user) {
		return http.delete("/logout", { params: { username: user } });
	}

	static register(user) {
		return http.post("/register", { user }).catch((error) => {
			swal({
				icon: "error",
				title: "Error",
				text: error.message,
				buttons: false,
			});
		});
	}

	static get_surveyee_assessment(username) {
		return http
			.get("/surveyee/assessment", { params: { username } })
			.catch((error) => {
				if (error.message.includes("401")) {
					swal({
						icon: "error",
						title: "Unauthorized",
						text: "Please sign in first",
						buttons: false,
					});
				} else {
					swal({
						icon: "error",
						title: "Error",
						text: error.message,
						buttons: false,
					});
				}
			});
	}

	static download_surveyee_assessment(department, username) {
		return http
			.get("/surveyee/assessment/download", {
				params: { department, username },
				headers: {
					"Content-Disposition": "attachment",
				},
				responseType: "blob",
			})
			.catch((error) => {
				swal({
					icon: "error",
					title: "Error",
					text: error.message,
					buttons: false,
				});
			});
	}
}

export default HMWADataService;
