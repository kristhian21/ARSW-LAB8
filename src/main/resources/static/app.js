var points = [];

var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var actualDraw;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    function initMouse () {
        console.info('Mouse initialized');
        var canvas = document.getElementById("canvas"),
            context = canvas.getContext("2d");
        if (window.PointerEvent) {
            canvas.addEventListener("pointerdown", DrawAndSend, false);
        }
    }

    function DrawAndSend () {
        console.info("Entrar a pintado")
        var canvas = document.getElementById("canvas"),
            context = canvas.getContext("2d");
        var offsetleft = parseInt(getOffset(canvas).left, 10);
        var offsettop = parseInt(getOffset(canvas).top, 10);
        var x = event.pageX - offsetleft;
        var y = event.pageY - offsettop;
        var pt=new Point(x,y);
        points.push(pt)
        addPointToCanvas(pt);
        stompClient.send("/app/newpoint."+actualDraw, {}, JSON.stringify(pt));
    }

    function getOffset (obj) {
        var offsetLeft = 0;
        var offsetTop = 0;
        do {
            if (!isNaN(obj.offsetLeft)) {
                offsetLeft += obj.offsetLeft;
            }
            if (!isNaN(obj.offsetTop)) {
                offsetTop += obj.offsetTop;
            }
        } while (obj = obj.offsetParent);
        return { left: offsetLeft, top: offsetTop };
    }


    var connectAndSubscribe = function (drawNumber) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+drawNumber, function (eventbody) {
                var point=JSON.parse(eventbody.body);
                var newPoint = new Point(point.x, point.y);
                addPointToCanvas(newPoint);
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            // Init Mouse
            initMouse();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            //publicar el evento
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        },

        connectToDraw : function(drawNumber){
            actualDraw = drawNumber;
            connectAndSubscribe(drawNumber);
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();