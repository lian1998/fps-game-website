declare type IntersectResult = {
    distance: number, // —— 射线投射原点和相交部分之间的距离。
    point: THREE.Vector3, //—— 相交部分的点（世界坐标）
    face: { // —— 相交的面 
        a: number,
        b: number,
        c: number,
        normal: THREE.Vector3,
        materialIndex: number
    },
    faceIndex: number, // —— 相交的面的索引
    object: THREE.Object3D, // —— 相交的物体
    uv: THREE.Vector2, // —— 相交部分的点的UV坐标。
    uv2: THREE.Vector2 //—— Second set of U,V coordinates at point of intersection
    instanceId: number //– The index number of the instance where the ray intersects the InstancedMesh
}