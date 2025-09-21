const validator = require("validator")

const validateSignupData = (request) => {
    const { firstName, lastName, email, password } = request.body
    if (!firstName || firstName.length < 4 || firstName.length > 15) {
        throw new Error("First name is not valid")
    }
    else if (lastName && (lastName.length < 4 || lastName.length > 15)) {
        throw new Error("Last name is not valid")
    }
    else if (!validator.isEmail(email)) {
        throw new Error("Email is not valid")
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error("Password is not strong")
    }
}

const validatePatchData = (request) => {
    const ALLOWED_UPDATES = ["firstName", "lastName", "about", "skills", "gender", "age", "photoUrl"]
    const isUpdatesAllowed = Object.keys(request.body).every((key) => ALLOWED_UPDATES.includes(key))
    if (!isUpdatesAllowed)
        throw new Error("Update is not allowed")
    else {
        const { firstName, lastName, about, skills, gender, age, photoUrl } = request.body
        if (firstName && (firstName.length < 4 || firstName.length > 15)) {
            throw new Error("First name is not valid")
        } else if (lastName && (lastName.length < 4 || lastName.length > 15)) {
            throw new Error("Last name is not valid")
        } else if (about && about.length > 100) {
            throw new Error("About must be less than 100 characters")
        } else if (age && age < 18) {
            throw new Error("Invalid age: Must be atleast 18")
        }
    }
    return isUpdatesAllowed
}


module.exports = { validateSignupData, validatePatchData }
