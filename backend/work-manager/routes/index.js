var express = require('express');
var router = express.Router();

const User = require('../models/User');
const WorkItem = require('../models/WorkItem');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, skills } = req.body;

    
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      skills
    });

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ msg: "Invalid password" });
    }

   
    const payload = {
      id: user._id,
      role: user.role
    };

   
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const auth = (roles = []) => (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ msg: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};


router.get('/users', auth(['admin']), async (req, res) => {
  const users = await User.find();
  res.json(users);
});


router.post('/work', auth(['admin']), async (req, res) => {
  try {
    const work = await WorkItem.create(req.body);
    res.json(work);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/assign/:id', auth(['admin']), async (req, res) => {
  const work = await WorkItem.findById(req.params.id);

  const users = await User.find({ role: 'member' });

  let bestUser = null;
  let minLoad = Infinity;

  for (let u of users) {
    let load = await WorkItem.countDocuments({ assignedTo: u._id, status: { $ne: 'completed' } });

    if (load < minLoad) {
      minLoad = load;
      bestUser = u;
    }
  }

  work.assignedTo = bestUser._id;
  await work.save();

  res.json({ work, assignedTo: bestUser });
});


router.post('/dependency/:id', async (req, res) => {
  const { dependsOn, type, percentageRequired } = req.body;

  const work = await WorkItem.findById(req.params.id);


  if (req.params.id === dependsOn) {
    return res.json({ msg: "Circular dependency not allowed" });
  }

  work.dependencies.push({
    workItem: dependsOn,
    type,
    percentageRequired
  });

  await work.save();

  res.json(work);
});


router.put('/work/:id/progress', auth(), async (req, res) => {
  const work = await WorkItem.findById(req.params.id);

  work.progress = req.body.progress;

  if (work.progress === 100) {
    work.status = 'completed';
  } else {
    work.status = 'in-progress';
  }

  await work.save();

  res.json(work);
});

router.put('/work/:id/block', async (req, res) => {
  const work = await WorkItem.findById(req.params.id);

  work.status = 'blocked';
  work.blockedReason = req.body.reason;

  await work.save();

  res.json(work);
});


router.get('/work', async (req, res) => {
  const work = await WorkItem.find()
    .populate('assignedTo')
    .populate('dependencies.workItem');

  res.json(work);
});


router.get('/work/status-check', async (req, res) => {
  const items = await WorkItem.find().populate('dependencies.workItem');

  let ready = [];
  let blocked = [];

  for (let item of items) {
    let isBlocked = false;

    for (let dep of item.dependencies) {
      if (dep.type === 'full' && dep.workItem.progress < 100) {
        isBlocked = true;
      }
      if (dep.type === 'partial' && dep.workItem.progress < dep.percentageRequired) {
        isBlocked = true;
      }
    }

    if (isBlocked) blocked.push(item);
    else ready.push(item);
  }

  res.json({ ready, blocked });
});



router.get('/users', auth(['admin']), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});


module.exports = router;
