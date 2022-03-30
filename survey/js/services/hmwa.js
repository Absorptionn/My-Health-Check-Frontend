import http from "./http-common.js";

class HMWADataService {
	static get_surveyee_information(email) {
		return http
			.get("/surveyee/information", { params: { email } })
			.catch((error) => {
				if (error.message == "Network Error") {
					swal({
						icon: "error",
						title: "Error",
						text: error.message,
						buttons: false,
					});
				}
			});
	}

	static put_surveyee_information(surveyee) {
		return http.put("/surveyee/information", { surveyee });
	}

	static put_surveyee_assessment(email, assessment) {
		return http.put(
			"/surveyee/assessment",
			{ assessment },
			{
				params: { email },
			}
		);
	}
}

export default HMWADataService;
