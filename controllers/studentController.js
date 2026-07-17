const Student = require('../models/Student');

exports.index = (req, res) => {
  const search = req.query.q || '';
  const students = Student.all(search);
  res.render('students/index', { students, search, title: 'Students' });
};

exports.newForm = (req, res) => {
  res.render('students/form', { student: null, title: 'Add Student' });
};

exports.create = (req, res) => {
  const { name, roll_number, class_section, phone, email } = req.body;
  Student.create({
    name,
    roll_number,
    class_section: class_section || null,
    phone: phone || null,
    email: email || null
  });
  res.redirect('/students');
};

exports.editForm = (req, res) => {
  const student = Student.findById(req.params.id);
  if (!student) return res.status(404).send('Student not found');
  res.render('students/form', { student, title: 'Edit Student' });
};

exports.update = (req, res) => {
  const { name, roll_number, class_section, phone, email } = req.body;
  Student.update(req.params.id, {
    name,
    roll_number,
    class_section: class_section || null,
    phone: phone || null,
    email: email || null
  });
  res.redirect('/students');
};

exports.delete = (req, res) => {
  Student.delete(req.params.id);
  res.redirect('/students');
};
