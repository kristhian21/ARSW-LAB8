package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private AbstractMap<String, ArrayList<Point>> pointsCollection = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        msgt.convertAndSend("/topic/newpoint"+numdibujo, pt);
        // Verify the draw number
        if (pointsCollection.containsKey(numdibujo)){
            ArrayList<Point> drawCollection = pointsCollection.get(numdibujo);
            drawCollection.add(pt);
            if (drawCollection.size() == 4){
                msgt.convertAndSend("/topic/newpolygon."+numdibujo, new Polygon(drawCollection));
                drawCollection.clear();
            }
        }
        else {
            ArrayList<Point> newCollection = new ArrayList<Point>();
            newCollection.add(pt);
            pointsCollection.put(numdibujo, newCollection);
        }
    }
}