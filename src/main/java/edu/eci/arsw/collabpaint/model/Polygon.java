package edu.eci.arsw.collabpaint.model;

import java.util.ArrayList;

public class Polygon {

    private ArrayList<Point> points = new ArrayList<>();

    public Polygon(ArrayList<Point> points) {
        this.points = points;
    }

    public ArrayList<Point> getPoints() {
        return points;
    }

    public void setPoints(ArrayList<Point> points) {
        this.points = points;
    }

}
