/**
 * Created by altitude on 09/01/17.
 */
var Bronko = {
    Config: {
        targets:['div','span','p'],
        brackets:'{}',
        comments:'{..}',
        plugins: {
            translate: true,
            encode: false
        }
    },
    Index:{},
    Init:{
        Matches:function(){
            /*
            find all json nodes form the source file and
            place them in a global object
             */
            $.ajax({
                url:'data/source.json',
                method:'GET',
                success:function(data){
                    $.each(data,function(key,value){
                        Bronko.Index[key] = value;
                    })
                },error:function(){
                },complete:function(){
                    /*
                    ondce all indexes have been stored in the
                    Index object, we can start searching in the
                    html for Bronko template objects
                     */
                    Bronko.Init.Content();
                }
            })
        },
        Content:function(node,text){
            node = node || 'body';
            var keyString = '';
            $.each(bi,function(key,value){
                var targetObject = $(node).find('tpl');
                if(targetObject !== undefined && targetObject !== '') {
                    var templateNode = targetObject.html();
                    if (templateNode !== undefined && templateNode.indexOf('{' + key + '}') > -1) {
                        var brutNode = templateNode.split('{' + key + '}')[1];
                        brutNode = brutNode.split('{/' + key + '}')[0];
                        if (typeof value == 'object') {
                            brutNode = brutNode.replace('{', '').replace('}', '');
                            for (var o in value) {
                                keyString += value[o][brutNode] + ' ';
                            }
                        }
                        var newObject = '<div>' + templateNode.replace(templateNode, keyString) + '</div>';
                        $(newObject).insertBefore(targetObject);
                        $(targetObject).remove();
                    }
                }
            });
        }
    }
};
var $b = b = Bronko;
var bi = Bronko.Index;
