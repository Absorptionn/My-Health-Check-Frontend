export default axios.create({
	baseURL: "https://auf-my-health-check.herokuapp.com/api/v1/hmwa",
	headers: {
		"Content-type": "application/json",
	},
});
