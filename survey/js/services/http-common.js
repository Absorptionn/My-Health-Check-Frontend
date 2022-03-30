export default axios.create({
	// baseURL: "https://auf-my-health-check.herokuapp.com/api/v1/hmwa",
	baseURL: "http://localhost:5000/api/v1/hmwa",
	headers: {
		"Content-type": "application/json",
	},
});
