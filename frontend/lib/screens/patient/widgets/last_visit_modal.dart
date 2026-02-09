import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';

class LastVisitModal extends StatelessWidget {
  final Map<String, dynamic>? lastVisit;
  final VoidCallback onSeeAllVisits;

  const LastVisitModal({
    super.key,
    required this.lastVisit,
    required this.onSeeAllVisits,
  });

  @override
  Widget build(BuildContext context) {
    // If no visit data
    if (lastVisit == null) {
      return _buildNoVisitView(context);
    }

    final visitDate = lastVisit!['visitDate'] != null
        ? DateTime.parse(lastVisit!['visitDate'])
        : DateTime.now();
    final formattedDate = DateFormat('MMMM d, yyyy').format(visitDate);
    final notes = lastVisit!['notes'] ?? 'No doctor notes available.';
    final recommendations =
        lastVisit!['recommendations'] ?? 'No recommendations provided.';

    return Container(
      height: MediaQuery.of(context).size.height * 0.85, // Maximize UI
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(30),
          topRight: Radius.circular(30),
        ),
      ),
      child: Column(
        children: [
          // Drag Handle
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Last Visit Report',
                      style: GoogleFonts.poppins(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    Text(
                      formattedDate,
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, size: 20),
                  ),
                ),
              ],
            ),
          ),

          const Divider(),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildSectionHeader(
                    'Doctor Notes',
                    Icons.description_outlined,
                    Colors.blue,
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.blue.withOpacity(0.1)),
                    ),
                    child: Text(
                      notes,
                      style: GoogleFonts.poppins(
                        fontSize: 15,
                        height: 1.6,
                        color: Colors.black87,
                      ),
                    ),
                  ).animate().fadeIn().slideY(begin: 0.1),

                  const SizedBox(height: 24),

                  _buildSectionHeader(
                    'Recommendations',
                    Icons.medical_services_outlined,
                    Colors.green,
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.green.withOpacity(0.1)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          recommendations,
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            height: 1.6,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),

                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),

          // Bottom Button
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 20,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context); // Close modal
                onSeeAllVisits(); // Navigate
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF43A047),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: Text(
                'See All Visits',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildNoVisitView(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.5,
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(30),
          topRight: Radius.circular(30),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 40),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.blueGrey.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.history_edu_outlined,
              size: 48,
              color: Colors.blueGrey,
            ),
          ).animate().scale(),
          const SizedBox(height: 24),
          Text(
            'No Visits Yet',
            style: GoogleFonts.poppins(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'You haven\'t had any medical visits recorded yet.',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(fontSize: 15, color: Colors.grey[600]),
          ),
          const Spacer(),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.grey[200],
              foregroundColor: Colors.black87,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            child: Text(
              'Close',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
