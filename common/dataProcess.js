/**
 * Created by Ian on 2016/3/6.
 */

/**
 * This part lecture scenario json and give infos back on
 * 见文档“备忘录”部分
 * dp = data processor
 * @param data: Obj, scriptObject
 */
ns.initDp = function (data) {
    var dp = {};
    /**
     * dp.get return a serif indicating script and position given from the scenario json obj
     * a script if no position is given
     * @param script
     * @param position
     * @returns {*}
     */
    dp.get = function (script, position) {
        if(position === undefined) return data[script];
        else return data[script][position]
    };

    /**
     * do a dp.get where script and position are read from ns.state.state
     * @returns {*}
     */
    dp.getFromState= function () {
        return dp.get(ns.state.state.script, ns.state.state.position)
    };
    /**
     * fix stack when jumpScript is called
     * @param script
     * @param position
     */
    dp.stackFix = function (script, position) {
        // 读取未受到修改的剧本文件，并获取一份断开指针的副本
        var stack = $.extend({}, ns.tmpData[script][position]);
        // 如果位置是剧本第0句，那么剧本文件上的内容不需要修改，直接返回
        if(position === 0){
            return stack;
        }
        // 在需要修改的情况，先找出所有的不完整项
        var isIncomplete = function (stack) {
            var lack = [];
            // 如果未提供立绘，那很可能是不完整的
            if(!stack.figure) lack.push("figure");
            else {
                // 如果提供立绘，则寻找其中的不完整项
                for(var i = 0; i < stack.figure.length; i++){
                    if(stack.figure[i] === "" || stack.figure[i] === 0 || stack.figure[i] === "0"){
                        lack.push("figure");
                        break;
                    }
                }
            }
            if(stack.cg === undefined) lack.push("cg");
            if(stack.bg === undefined) lack.push("bg");
            if(stack.bgm === undefined) lack.push("bgm");
            if(!lack.length) return false;
            else return lack;
        };
        var lack = isIncomplete(stack);
        if(!lack) return stack;
        // stack.cg = "0"; // fix the error when jump forward where a cg is never shown // useless
        var fix = function () {
            var figure = [];
            for(var i = 0; i <= position; i++){
                var thisFigure = dp.get(script, i).figure;
                if(thisFigure){
                    for(var j = 0; j < thisFigure.length; j++){
                        if(thisFigure[j] !== ""){
                            figure[j] = thisFigure[j]
                        }
                    }
                }
                var thisCg = dp.get(script, i).cg;
                console.log(thisCg);
                if(thisCg){
                    stack.cg = thisCg
                }else stack.cg = 0;
                var thisBg = dp.get(script, i).bg;
                if(thisBg){
                    stack.bg = thisBg
                }else stack.bg = 0;
                var thisBgm = dp.get(script, i).bgm;
                if(thisBg){
                    stack.bgm = thisBgm
                }else stack.bgm = 0;
            }
            var tmp = [];
            for (j = 0; j < figure.length; j++) {
                if (figure[j] !== 0 && figure[j] !== "0") {
                    tmp.push(figure[j])
                }
            }
            stack.figure = tmp;
        };
        // main fix
        fix();
        console.log(stack);
        return stack
    };

    dp.resourceCollector = function (data) {
        data = data || ns.data;
        var media = {};
        media.images = [];
        media.audios = [];
        // resource collector version front-end
        var keys = Object.keys(data);
        for(var key = 0; key < keys.length; key++){
            var script = data[Object.keys[data][key]];
            for(var i = 0; i < script.length; i++){
                // figure
                for(var figure = 0; figure < script[i].figure.length; figure++){
                    var f = script[i].figure[figure];
                    if(f && (!media.images.indexOf(f))) media.images.push(f)
                }
                // cg, bg, bgm
                var cg = script[i].cg;
                if(cg && (!media.images.indexOf(cg))) media.images.push(cg);
                var bg = script[i].bg;
                if(bg && (!media.images.indexOf(bg))) media.images.push(bg);
                var bgm = script[i].bgm;
                if(bgm && (!media.audios.indexOf(bgm))) media.audios.push(bgm);
            }
        }
        return media
    };

    dp.firstScript = function () {
        return data[Object.keys(data)[0]]
    };

    dp.firstScriptName = function () {
        return Object.keys(data)[0]
    };

    /**
     * Go throughout the whole data, and do f to each page
     * @param f
     */
    dp.throughout = function (f) {
        var keys = Object.keys(data);
        for(var i = 0; i < keys.length; i++){
            var script = data[keys[i]];
            for(var j = 0; j < script.length; j++){
                f(script[j])
            }
        }
    };

    return dp
};

ns.dp = {};