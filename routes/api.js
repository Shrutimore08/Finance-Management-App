const express = require("express");
const Joi = require("joi");
const Service = require("../models/Service");
const Request = require("../models/Request");
const Member = require("../models/Member");

const router = express.Router();

// 1. Get all services
router.get("/allservices", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch services" });
  }
});

// 2. Get specific service by type
router.get("/service/:type", async (req, res) => {
  try {
    const service = await Service.findOne({ type: req.params.type });
    res.status(200).json(service || { error: "Service not found" });
  } catch (error) {
    res.status(500).json({ error: "Error fetching service" });
  }
});

// 3. Submit loan request
router.post("/service/:type/form", async (req, res) => {
  const schema = Joi.object({
    mobile: Joi.number().required(),
    email: Joi.string().email().required(),
    amt: Joi.number().required(),
    type: Joi.string().required(),
    msg: Joi.string(),
    code: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const request = new Request(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: "Unable to submit request" });
  }
});

// 4. Register a member
router.post("/members/register", async (req, res) => {
  const schema = Joi.object({
    mobile: Joi.number().required(),
    email: Joi.string().email().required(),
    occupation: Joi.string().required(),
    createpassword: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const existingMember = await Member.findOne({ mobile: req.body.mobile });
    if (existingMember) {
      return res.status(400).json({ error: "Member already exists" });
    }

    const member = new Member(req.body);
    await member.save();
    res.status(201).json({ message: "Member registered successfully", member });
  } catch (err) {
    res.status(500).json({ error: "Unable to register member" });
  }
});

// 5. Calculate EMI
router.post("/service/:type/calculate", async (req, res) => {
  const schema = Joi.object({
    amt: Joi.number().required(),
    tenure: Joi.number().required(), // in months
    interestRate: Joi.number().required() // annual interest rate in percentage
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { amt, tenure, interestRate } = req.body;

    // EMI Calculation Formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
    const monthlyRate = interestRate / (12 * 100); // convert annual rate to monthly rate
    const emi =
      (amt * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);

    res.status(200).json({ EMI: emi.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: "Unable to calculate EMI" });
  }
});

// 6. Update loan request details
router.put("/updaterequest", async (req, res) => {
  const schema = Joi.object({
    mobile: Joi.number().required(),
    service: Joi.string().required(),
    type: Joi.string().required(),
    remarks: Joi.string()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const updatedRequest = await Request.findOneAndUpdate(
      { mobile: req.body.mobile },
      { $set: { ...req.body } },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json(updatedRequest);
  } catch (err) {
    res.status(500).json({ error: "Unable to update request" });
  }
});

// 7. Update member password
router.put("/updatepassword", async (req, res) => {
  const schema = Joi.object({
    mobile: Joi.number().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const updatedMember = await Member.findOneAndUpdate(
      { mobile: req.body.mobile },
      { $set: { createpassword: req.body.password } },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.status(200).json({ message: "Password updated successfully", updatedMember });
  } catch (err) {
    res.status(500).json({ error: "Unable to update password" });
  }
});

// 8. Delete a loan request
router.delete("/deleterequest", async (req, res) => {
  const schema = Joi.object({
    mobile: Joi.number().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const deletedRequest = await Request.findOneAndDelete({ mobile: req.body.mobile });

    if (!deletedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json({ message: "Request deleted successfully", deletedRequest });
  } catch (err) {
    res.status(500).json({ error: "Unable to delete request" });
  }
});

// 9. Cancel membership
router.delete("/cancelmember", async (req, res) => {
  const schema = Joi.object({
    mobile: Joi.number().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const deletedMember = await Member.findOneAndDelete({ mobile: req.body.mobile });

    if (!deletedMember) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.status(200).json({ message: "Membership cancelled successfully", deletedMember });
  } catch (err) {
    res.status(500).json({ error: "Unable to cancel membership" });
  }
});

module.exports = router;
