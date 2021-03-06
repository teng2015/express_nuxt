var express = require("express");
var router = express.Router();
const querystring = require("querystring");

router.get("/get", function(req, res) {
    var str = "";
    var arr = [];
    // 获取id
    if (req.query.id) {
       str+= ` and bbs.id=${parseInt(req.query.id)}`;
    }
    // 获取用户
    if (req.query.uid && parseInt(req.query.uid) > 0) {
        str+= ` and bbs.user=${parseInt(req.query.uid)}`;
    }
    // 不是自己不能获取没公开的内容
    if (!req.query.uid || req.query.uid != req.session.user.id) {
        str+= ` and issearch=1`;
    }
    // title模糊查询
    if (req.query.title) {
        str+= ` like title=%${req.sql.pool.escape(req.query.title)}%`;
    }

    if (str) {
        str = " where 1=1 " + str;
    }
    if (req.query.desc == "true") {
        str += ` ORDER BY bbs.id DESC`;
    }
    str += ` limit ?`;
    arr.push(parseInt(req.query.limit) || 15);

    if (req.query.offset && parseInt(req.query.offset) > 0) {
        str += ` offset ?`;
        arr.push(parseInt(req.query.offset));
    }

    // console.log(str)

    req.sql.query(
        `SELECT bbs.id,bbs.user,user.name as username,title,content,updatetime FROM bbs left join user on bbs.user=user.id ${str}`,
        arr,
        function(err, result, fields) {
            if (err) {
                res.back(-1, "sql查询错误");
            } else if (result.length >= 1) {
                res.back(1, result, "获取成功");
            } else {
                res.back(-1, "没有数据");
            }
        }
    );
});
// router.get("/get/:id", function(req, res) {
//     if (!req.params.id) {
//         res.back(-1, "缺少帖子id");
//         return;
//     }
//     req.sql.query("SELECT * FROM bbs where id=?", [req.params.id], function(
//         err,
//         result,
//         fields
//     ) {
//         if (result.length == 1) {
//             res.back(1, result, "获取成功");
//         } else {
//             res.back(-1, "没有数据");
//         }
//     });
// });

router.post("/add", function(req, res) {
    if (!req.session.user || !req.session.user.id) {
        res.back(-1, "用户未登录");
        return;
    }
    if (!req.body.class_id) {
        res.back(-1, "未选择分类");
        return;
    }
    if (!req.body.title || !req.body.content) {
        res.back(-1, "请填写标题与内容");
        return;
    }
    req.sql.query(
        `insert into bbs (class_id,title,content,user) values (?,?,?,${
            req.session.user.id
        })`,
        [req.body.class_id, req.body.title, req.body.content],
        function(err, result, fields) {
            console.log(result);
            if (err) {
                res.back(-1, "发布失败");
            } else if (result) {
                res.back(1, result, "添加成功");
            }
        }
    );
});

router.post("/edit", function(req, res) {
    if (!req.session.user || !req.session.user.id) {
        res.back(-1, "用户未登录");
        return;
    }
    if (!req.body.id) {
        res.back(-1, "未指定修改帖子");
        return;
    }
    if (!req.body.class_id) {
        res.back(-1, "未选择分类");
        return;
    }
    if (!req.body.title || !req.body.content) {
        res.back(-1, "请填写标题与内容");
        return;
    }
    req.sql.query(
        `update bbs set class_id=?,title=?,content=? where id=? and user=?`,
        [
            req.body.class_id,
            req.body.title,
            req.body.content,
            req.body.id,
            req.session.user.id
        ],
        function(err, result, fields) {
            console.log(result);
            if (err) {
                res.back(-1, "更新失败");
            } else if (result) {
                res.back(1, result, "更新成功");
            }
        }
    );
});

module.exports = router;
