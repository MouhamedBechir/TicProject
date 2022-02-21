const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config/auth.config");
const db = require("../models");
const nodemailer = require("../config/nodemailer.config");
const Student = db.student;
const Company = db.company;
const Admin = db.admin;
const Offer = db.offer;
const Document = db.document;
const Message = db.message;
const New = db.new;
const fs = require('fs');

exports.getNews = (rep, res) => {
    
    
    New.find().exec()
        .then(docs => {
            const response = [];
            docs.forEach((doc) => {
                response.push(doc);
            });
            response.reverse();
            res.status(200).send(response);
        }).catch(err => {
            res.status(500).send({ message: err });
        });
}

exports.deleteNews = (req, res) => {
    New.deleteOne({_id: req.params.id}).exec()
    .then(() => {
        res.status(200).send({message : "News deleted !"});
    }).catch(err => {
        res.status(500).send({ message: err });
    });
}

exports.newsDoc = (req , res) =>{
    console.log(req.query);
    var filePath = 'http://backend-ticenit.herokuapp.com/uploads/';
    if(req.file && req.file.filename){
        console.log(req.file);
        filePath += req.file.filename;
        res.status(201).send({ link: filePath, name : req.file.originalname });
    }else{
        return res.status(500).send({ message: "Error !" });
    }
}

exports.addNews = (req, res) => {
    const news = new New({
        _id: new db.mongoose.Types.ObjectId(),
        title : req.body.title,
        content : req.body.content,
        date : req.body.date,
        picture: req.body.picture,
        docs: req.body.docs
    });
    news.save((err, document) => {
        if (err) {
            return res.status(500).send({ message: err });
        }
        res.status(201).send({ message: "News was added successfully!" });
    });
}

exports.deleteMessage = (req, res) => {
    Message.deleteOne({_id: req.params.id}).exec()
    .then(() => {
        res.status(200).send({message : "Message deleted !"});
    }).catch(err => {
        res.status(500).send({ message: err });
    });
}

exports.getNbMessage = (req, res) => {
    Message.find({["lu"]: false}).exec()
        .then(docs => {
            const response = {nb : docs.length};
            res.status(200).send(response);
        }).catch(err => {
            res.status(500).send({ message: err });
        });
}

exports.getMessage = (req, res) => {
    
    const newData = new Message({
        lu : true
    });
    Message.updateMany(newData)
        .then(() => {
        }).catch(err => {
            console.log(err);
        });
    Message.find().exec()
        .then(docs => {
            const response = [];
            docs.forEach((doc) => {
                response.push({
                    name : doc.name,
                    date : doc.date,
                    message : doc.message,
                    email: doc.email,
                    lu: doc.lu,
                    id: doc._id,
                });
            });
            response.reverse();
            res.status(200).send(response);
        }).catch(err => {
            res.status(500).send({ message: err });
        });
}

exports.saveMessage = (req, res) => {
    const message = new Message({
        _id: new db.mongoose.Types.ObjectId(),
        name : req.body.name,
        email : req.body.email,
        date : req.body.date,
        message: req.body.message,
        lu: req.body.lu
    });
    message.save((err, document) => {
        if (err) {
            return res.status(500).send({ message: err });
        }
        res.status(201).send({ message: "Message was sent successfully!" });
    });
}

exports.searchDocument = (req, res) => {
    Document.find({ ["title"]: { $regex: new RegExp("^" + req.body.title, "i") }}).exec()
        .then(docs => {
            const response = [];
            docs.forEach((doc) => {
                response.push({
                    idcreator : doc.idcreator,
                    namecreator : doc.namecreator,
                    date : doc.date,
                    title: doc.title,
                    extension: doc.extension,
                    type: doc.type,
                    link: doc.link,
                    emplacement: doc.emplacement,
                    id: doc._id,
                    size: doc.size
                });
            });
            res.status(200).send(response);
        }).catch(err => {
            res.status(500).send({ message: err });
        });
}

exports.createFolder = (req, res) => {
    const document = new Document({
        _id: new db.mongoose.Types.ObjectId(),
        idcreator : req.body.idcreator,
        namecreator : req.body.namecreator,
        date : req.body.date,
        title: req.body.title,
        type: "folder",
        link: "",
        extension: "",
        emplacement: req.body.emplacement,
        size: ""
    });
    document.save((err, document) => {
        if (err) {
            return res.status(500).send({ message: err });
        }
        res.status(201).send({ message: "Folder was created successfully!" });
    });
}

exports.deleteDocument = (req, res) => {
    if(req.body.type == 'file'){
        try {
            //remove file
            fs.unlinkSync("uploads/" + req.body.link.split('/')[req.body.link.split('/').length - 1])
          } catch(err) {
            console.error(err)
          }
        Document.deleteOne({
            title : req.body.title,
            emplacement : req.body.emplacement
        }).exec()
            .then(() => {
                res.status(200).send({ message: req.body.type + " deleted" });
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({ message: err });
            });
    }else{
        Document.deleteOne({
        title : req.body.title,
        emplacement : req.body.emplacement
    }).exec()
        .then(() => {
            res.status(200).send({ message: req.body.type + " deleted" });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({ message: err });
        });
    }
    
}

exports.createFile = (req, res) => {
    console.log(req.query);
    var filePath = 'http://backend-ticenit.herokuapp.com/uploads/';
    if(req.file && req.file.filename){
        filePath += req.file.filename;
    }
    const document = new Document({
        _id: new db.mongoose.Types.ObjectId(),
        idcreator : req.query.idcreator,
        namecreator : req.query.namecreator,
        date : req.query.date,
        title: req.query.title,
        type: "file",
        link: filePath,
        extension: req.query.type,
        emplacement: req.query.emplacement,
        size: req.query.size,
    });
    console.log(document);
    document.save((err, document) => {
        if (err) {
            return res.status(500).send({ message: err });
        }
        res.status(201).send({ message: "File was uploaded successfully!" });
    });
}


exports.getDocuments = (req, res) => {
    Document.find({ ["emplacement"]: req.body.emp}).exec()
        .then(docs => {
            const response = [];
            docs.forEach((doc) => {
                response.push({
                    idcreator : doc.idcreator,
                    namecreator : doc.namecreator,
                    date : doc.date,
                    title: doc.title,
                    extension: doc.extension,
                    type: doc.type,
                    link: doc.link,
                    emplacement: doc.emplacement,
                    id: doc._id,
                    size: doc.size
                });
            });
            res.status(200).send(response);
        }).catch(err => {
            res.status(500).send({ message: err });
        });
}

exports.signin = (req, res) => {
    Admin.findOne({
        email: req.body.email
    }).exec((err, admin) => {
        if (err) {
            return res.status(500).send({ message: err });
        }

        if (!admin) {
            return res.status(404).send({ message: "Admin Not found." });
        }

        var passwordIsValid = bcrypt.compareSync(req.body.password, admin.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign({ email: admin.email, id: admin._id }, config.secret, { expiresIn: "999999h" });

        return res.status(200).send({
            name : "Administrator",
            id: admin._id,
            email: admin.email,
            accessToken: token
        });
    });
};

exports.getAllStudents = (req, res, next) => {
    Student.find()
        .exec()
        .then(docs => {
            const response = [];
            docs.forEach((doc) => {
                response.push({
                    firstname: doc.firstname,
                    lastname: doc.lastname,
                    email: doc.email,
                    country: doc.country,
                    city: doc.city,
                    address: doc.address,
                    phone: doc.phone,
                    type: doc.type,
                    workAt: doc.workAt,
                    class: doc.class,
                    promotion: doc.promotion,
                    linkedin: doc.linkedin,
                    picture: doc.picture,
                    aboutme: doc.aboutme,
                    latitude: doc.latitude,
                    longitude: doc.longitude,
                    id: doc._id
                });
            });
            if (docs.length >= 0) {
                res.status(200).send(response);
            } else {
                res.status(404).send({ message: 'No entries found' });
            }
        })
        .catch(err => {
            res.status(500).send({ message: err });
        });
};

exports.getAllCompanies = (req, res, next) => {
    Company.find()
        .exec()
        .then(docs => {
            const response = [];
            docs.forEach((doc) => {
                response.push({
                    name: doc.name,
                    email: doc.email,
                    country: doc.country,
                    city: doc.city,
                    address: doc.address,
                    phone: doc.phone,
                    website: doc.website,
                    logo: doc.logo,
                    about: doc.about,
                    latitude: doc.latitude,
                    longitude: doc.longitude,
                    id: doc._id
                });
            });
            if (docs.length >= 0) {
                res.status(200).send(response);
            } else {
                res.status(404).send({ message: 'No entries found' });
            }
        })
        .catch(err => {
            res.status(500).send({ message: err });
        });
};

exports.sendEmail = (req, res, next) => {
    nodemailer.sendSearchEmail(
        req.body.emails,
        req.body.object,
        req.body.message,
    );
    return res.status(201).send({ message: "Email has been sent!" });
};

exports.getStudentsByKey = (req, res, next) => {
    Student.find({ [req.query.property]: { $regex: new RegExp("^" + req.query.key, "i") } }).exec()
        .then(docs => {
            const response = [];
            docs.forEach((doc) => {
                response.push({
                    firstname: doc.firstname,
                    lastname: doc.lastname,
                    email: doc.email,
                    country: doc.country,
                    city: doc.city,
                    address: doc.address,
                    phone: doc.phone,
                    type: doc.type,
                    workAt: doc.workAt,
                    class: doc.class,
                    promotion: doc.promotion,
                    linkedin: doc.linkedin,
                    picture: doc.picture,
                    aboutme: doc.aboutme,
                    id: doc._id
                });
            });
            if (docs.length >= 0) {
                res.status(200).send(response);
            } else {
                res.status(404).send({ message: 'No entries found' });
            }

        }).catch(err => {
            res.status(500).send({ message: err });
        });
};

exports.getCompaniesByKey = (req, res) => {
    Company.find({ [req.query.property]: { $regex: new RegExp("^" + req.query.key, "i") } }).exec()
        .then(docs => {
            const response = [];
            docs.forEach((doc) => {
                response.push({
                    name: doc.name,
                    email: doc.email,
                    country: doc.country,
                    city: doc.city,
                    address: doc.address,
                    phone: doc.phone,
                    website: doc.website,
                    logo: doc.logo,
                    about: doc.about,
                    id: doc._id
                });
            });
            if (docs.length >= 0) {
                res.status(200).send(response);
            } else {
                res.status(404).send({ message: 'No entries found' });
            }

        }).catch(err => {
            res.status(500).send({ message: err });
        });
};


exports.getStudentById = (req, res, next) => {
    Student.findById({
        _id: req.params.id
    }).then((student) => {
        if (!student) {
            return res.status(404).send({ message: "User Not found." });
        }

        return res.status(200).send({
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            country: student.country,
            city: student.city,
            address: student.address,
            phone: student.phone,
            type: student.type,
            workAt: student.workAt,
            class: student.class,
            promotion: student.promotion,
            linkedin: student.linkedin,
            picture: student.picture,
            aboutme: student.aboutme,
            latitude: student.latitude,
            longitude: student.longitude
        });

    }).catch(err => {
        res.status(500).send({ message: err });
    });

};

exports.getCompanyById = async (req, res) => {
    Company.findById({
        _id: req.params.id
    }).then((company) => {
        if (!company) {
            return res.status(404).send({ message: "Company Not found." });
        }
        const response = [];
        const result = Offer.find({ company_id: req.params.id })
            .exec()
            .then(docs => {
                if (!docs) {
                    return res.status(200).send({
                        name: company.name,
                        email: company.email,
                        country: company.country,
                        city: company.city,
                        address: company.address,
                        phone: company.phone,
                        website: company.website,
                        logo: company.logo,
                        about: company.about,
                        latitude: company.latitude,
                        longitude: company.longitude,
                        offers: "No Offers found.",
                    });
                }
                docs.forEach((doc) => {
                    response.push({
                        id: doc._id,
                        title: doc.title,
                        type: doc.type,
                        duration: doc.duration,
                        content: doc.content,
                        company: doc.company_id,
                        createdAt: doc.createdAt
                    });
                });
                return res.status(200).send({
                    name: company.name,
                    email: company.email,
                    country: company.country,
                    city: company.city,
                    address: company.address,
                    phone: company.phone,
                    website: company.website,
                    logo: company.logo,
                    about: company.about,
                    latitude: company.latitude,
                    longitude: company.longitude,
                    offers: response,
                });
            }).catch(err => {
                res.status(500).send({ message: "error" + err });
            });

    }).catch(err => {
        res.status(500).send({ message: err });
    });
};

exports.updateStudent = (req, res, next) => {
        const newData = new Student({
            status: 'Active',
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            country: req.body.country,
            city: req.body.city,
            address: req.body.address,
            phone: req.body.phone,
            type: req.body.type,
            workAt: req.body.workAt,
            class: req.body.class,
            promotion: req.body.promotion,
            linkedin: req.body.linkedin,
            picture: req.body.picture,
            aboutme: req.body.aboutme,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        });
        Student.updateOne({ _id: req.params.id }, newData)
            .then(() => {
                res.status(200).send({ message: "User updated" });
            }).catch(err => {
                console.log(err);
                res.status(500).send({ message: err });
            });
};

exports.updateCompany = (req, res) => {
        const newData = new Company({
            status: 'Active',
            name: company.name,
            email: company.email,
            country: company.country,
            city: company.city,
            address: company.address,
            phone: company.phone,
            website: company.website,
            logo: company.logo,
            about: company.about,
        });
        Company.updateOne({ _id: req.params.id }, newData)
            .then(() => {
                res.status(200).send({ message: "Company updated" });
            }).catch(err => {
                console.log(err);
                res.status(500).send({ message: err });
            });
};

exports.deleteStudent = (req, res, next) => {
        Student.deleteOne({
            _id: req.params.id
        }).exec()
            .then(() => {
                res.status(200).send({ message: "User deleted" });
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({ message: err });
            });

};

exports.deleteCompany = (req, res) => {
        Company.deleteOne({
            _id: req.params.id
        }).exec()
            .then(() => {
                res.status(200).send({ message: "Company deleted" });
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({ message: err });
            });
};

exports.deleteStudents = (req, res, next) => {
    const st = req.body.deleteArray;
    st.forEach((item) => {
        Student.deleteOne({
            _id: item
        }).exec()
            .catch(err => {
                console.log(err);
                res.status(500).send({ message: err });
            });
    });

    res.status(200).send({ message: "Deleted" });

};

exports.deleteCompanies = (req, res, next) => {
    const st = req.body.deleteArray;
    st.forEach((item) => {
        Company.deleteOne({
            _id: item.id
        }).exec()
            .catch(err => {
                console.log(err);
                res.status(500).send({ message: err });
            });
    });
    res.status(200).send({ message: "Deleted" });
};

exports.addStudents = async (req, res, next) => {
    const st = req.body.students;
    st.forEach(function (item, i, array) {
        bcrypt.hash("123456789", 10, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    message: err
                });
            } else {
                const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let confirmCode = '';
                for (let i = 0; i < 25; i++) {
                    confirmCode += characters[Math.floor(Math.random() * characters.length)];
                }
                const student = new Student({
                    _id: new db.mongoose.Types.ObjectId(),
                    firstname: item.firstname,
                    lastname: item.lastname,
                    email: item.email,
                    password: hash,
                    confirmationCode: confirmCode,
                    type: item.type
                });
                student.save((err, student) => {
                    if (err) {
                        return res.status(500).send({ message: err });
                    }
                    
                    nodemailer.sendConfirmationEmail(
                        student.firstname,
                        student.email,
                        student.confirmationCode
                    );
                    return res.status(200).send({ message: "Users was registered successfully! An email is sent" });
                });
    
            }
        })
    });

};
